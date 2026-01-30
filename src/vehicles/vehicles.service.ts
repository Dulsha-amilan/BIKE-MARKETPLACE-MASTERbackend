import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { JsonFileStore } from '../common/json-file-store';
import { loadFrontendSeed } from '../seed/frontend-seed';
import { Vehicle } from './vehicle.model';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FirebaseService } from '../firebase/firebase.service';

type UserVehiclesFile = { vehicles: Vehicle[] };

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  private seedVehicles: Vehicle[] = [];
  private userVehicles: Vehicle[] = [];

  private usingFirestore = false;
  private readonly vehiclesCollection = process.env.VEHICLES_COLLECTION || 'vehicles';
  private readonly persistence = (process.env.VEHICLES_PERSISTENCE || 'firestore').toLowerCase();

  private readonly store = new JsonFileStore<UserVehiclesFile>(
    path.resolve(process.cwd(), 'storage/user-vehicles.json'),
    { vehicles: [] },
  );

  constructor(private readonly firebase: FirebaseService) {}

  async onModuleInit() {
    const seed = await loadFrontendSeed();
    this.seedVehicles = (seed.sampleVehicles || []).map((v: any) => ({
      ...v,
      source: 'seed' as const,
    }));

    const legacyFileVehicles = await this.loadUserVehiclesFromFile();

    if (this.persistence === 'file') {
      this.usingFirestore = false;
      this.userVehicles = legacyFileVehicles;
      return;
    }

    const firestoreVehicles = await this.tryLoadUserVehiclesFromFirestore();
    this.userVehicles = firestoreVehicles;

    // One-time-ish migration: if Firestore is empty but legacy file has vehicles, upload them.
    if (this.usingFirestore && this.userVehicles.length === 0 && legacyFileVehicles.length > 0) {
      this.logger.log(
        `Migrating ${legacyFileVehicles.length} legacy vehicles from storage/user-vehicles.json to Firestore collection "${this.vehiclesCollection}"...`,
      );
      try {
        const db = await this.firebase.firestore();
        await Promise.all(
          legacyFileVehicles.map((v) =>
            db
              .collection(this.vehiclesCollection)
              .doc(v.id)
              .set({ ...v, source: 'user' }, { merge: true }),
          ),
        );
        this.userVehicles = legacyFileVehicles;
      } catch (err) {
        this.logger.warn('Firestore migration failed; continuing with Firestore data only.', err as any);
      }
    }
  }

  listAll(): Vehicle[] {
    const merged = [...this.userVehicles, ...this.seedVehicles];
    return merged.sort((a, b) => {
      const ta = a.postedAt ? Date.parse(a.postedAt) : 0;
      const tb = b.postedAt ? Date.parse(b.postedAt) : 0;
      return tb - ta;
    });
  }

  listUser(): Vehicle[] {
    return [...this.userVehicles].sort((a, b) => {
      const ta = a.postedAt ? Date.parse(a.postedAt) : 0;
      const tb = b.postedAt ? Date.parse(b.postedAt) : 0;
      return tb - ta;
    });
  }

  getById(id: string): Vehicle {
    const v = this.listAll().find((x) => x.id === id);
    if (!v) throw new NotFoundException('Vehicle not found');
    return v;
  }

  async create(dto: CreateVehicleDto): Promise<Vehicle> {
    const now = new Date().toISOString();

    const make = (dto.make || '').trim();
    const model = (dto.model || '').trim();
    const title = (dto.title || '').trim() || `${make} ${model}`.trim() || 'Untitled Vehicle';

    const id = `user-${slugify(`${make}-${model}`)}-${Date.now()}-${randomUUID().slice(0, 6)}`;

    const gallery = Array.isArray(dto.gallery) ? dto.gallery.filter(Boolean) : [];
    const image = dto.image || gallery[0] || '';

    const v: Vehicle = {
      id,
      source: 'user',
      type: dto.type,
      title,
      make,
      model,
      condition: dto.condition,
      year: dto.year ?? null,
      registerYear: dto.registerYear ?? dto.year ?? null,
      price: dto.price ?? null,
      mileageKm: dto.mileageKm ?? null,
      engineCapacityCc: dto.engineCapacityCc ?? null,
      engineCc: dto.engineCapacityCc ?? null,
      transmission: dto.transmission || '',
      fuelType: dto.fuelType || '',
      color: dto.color || '',
      location: dto.location || '',
      postedAt: now,
      phone: dto.phone || '',
      image,
      gallery,
      categories: Array.isArray(dto.categories) ? dto.categories : [],
      tags: Array.isArray(dto.tags) ? dto.tags : [],
    };

    this.userVehicles = [v, ...this.userVehicles];
    await this.saveUserVehicle(v);
    return v;
  }

  async update(id: string, patch: UpdateVehicleDto): Promise<Vehicle> {
    const idx = this.userVehicles.findIndex((v) => v.id === id);
    if (idx === -1) {
      // Prevent editing seed vehicles
      if (this.seedVehicles.some((v) => v.id === id)) {
        throw new ForbiddenException('Seed vehicles are read-only');
      }
      throw new NotFoundException('Vehicle not found');
    }

    const prev = this.userVehicles[idx];
    const next: Vehicle = {
      ...prev,
      ...patch,
      source: 'user',
    };

    this.userVehicles = this.userVehicles.map((v) => (v.id === id ? next : v));
    await this.saveUserVehicle(next);
    return next;
  }

  async remove(id: string): Promise<void> {
    const before = this.userVehicles.length;
    this.userVehicles = this.userVehicles.filter((v) => v.id !== id);
    if (this.userVehicles.length === before) {
      if (this.seedVehicles.some((v) => v.id === id)) {
        throw new ForbiddenException('Seed vehicles are read-only');
      }
      throw new NotFoundException('Vehicle not found');
    }
    await this.deleteUserVehicle(id);
  }

  private async saveUserVehicle(vehicle: Vehicle) {
    const v = { ...vehicle, source: 'user' as const };

    if (this.persistence !== 'file' && this.usingFirestore) {
      try {
        const db = await this.firebase.firestore();
        await db
          .collection(this.vehiclesCollection)
          .doc(v.id)
          .set(stripUndefined(v), { merge: true });
        return;
      } catch (err) {
        this.logger.warn('Failed writing vehicle to Firestore; falling back to file storage.', err as any);
        this.usingFirestore = false;
      }
    }

    await this.persistFile();
  }

  private async deleteUserVehicle(id: string) {
    if (this.persistence !== 'file' && this.usingFirestore) {
      try {
        const db = await this.firebase.firestore();
        await db.collection(this.vehiclesCollection).doc(id).delete();
        return;
      } catch (err) {
        this.logger.warn('Failed deleting vehicle from Firestore; falling back to file storage.', err as any);
        this.usingFirestore = false;
      }
    }

    await this.persistFile();
  }

  private async persistFile() {
    await this.store.write({ vehicles: this.userVehicles.map((v) => ({ ...v, source: 'user' })) });
  }

  private async loadUserVehiclesFromFile(): Promise<Vehicle[]> {
    const persisted = await this.store.read();
    return Array.isArray(persisted.vehicles)
      ? persisted.vehicles.map((v) => ({ ...v, source: 'user' as const }))
      : [];
  }

  private async tryLoadUserVehiclesFromFirestore(): Promise<Vehicle[]> {
    try {
      const db = await this.firebase.firestore();
      const snap = await db.collection(this.vehiclesCollection).get();
      const vehicles = snap.docs
        .map((d) => {
          const data: any = d.data() || {};
          const id = String(data.id || d.id);
          return {
            ...data,
            id,
            source: 'user' as const,
          } as Vehicle;
        })
        .filter((v) => v && v.id);

      this.usingFirestore = true;
      return vehicles;
    } catch (err) {
      this.usingFirestore = false;
      this.logger.warn(
        'Firestore is not available (check FIREBASE_SERVICE_ACCOUNT_PATH / FIREBASE_SERVICE_ACCOUNT_JSON). Using file storage for user vehicles.',
        err as any,
      );
      return await this.loadUserVehiclesFromFile();
    }
  }
}

function slugify(input: string): string {
  return (input || 'vehicle')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50);
}

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}
