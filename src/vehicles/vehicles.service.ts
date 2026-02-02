import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { loadFrontendSeed } from '../seed/frontend-seed';
import { Vehicle } from './vehicle.model';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  private seedVehicles: Vehicle[] = [];
  private userVehicles: Vehicle[] = [];

  private readonly vehiclesCollection = process.env.VEHICLES_COLLECTION || 'vehicles';

  constructor(private readonly firebase: FirebaseService) { }

  async onModuleInit() {
    const seed = await loadFrontendSeed();
    this.seedVehicles = (seed.sampleVehicles || []).map((v: any) => ({
      ...v,
      source: 'seed' as const,
    }));

    await this.loadUserVehiclesFromFirestore();
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

    try {
      const db = await this.firebase.firestore();
      await db
        .collection(this.vehiclesCollection)
        .doc(v.id)
        .set(stripUndefined(v), { merge: true });
    } catch (err) {
      this.logger.error('Failed writing vehicle to Firestore', err as any);
      throw err;
    }
  }

  private async deleteUserVehicle(id: string) {
    try {
      const db = await this.firebase.firestore();
      await db.collection(this.vehiclesCollection).doc(id).delete();
    } catch (err) {
      this.logger.error('Failed deleting vehicle from Firestore', err as any);
      throw err;
    }
  }

  private async loadUserVehiclesFromFirestore(): Promise<void> {
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

      this.userVehicles = vehicles;
    } catch (err) {
      this.logger.error(
        'Firestore is not available (check FIREBASE_SERVICE_ACCOUNT_PATH / FIREBASE_SERVICE_ACCOUNT_JSON).',
        err as any,
      );
      this.userVehicles = [];
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
