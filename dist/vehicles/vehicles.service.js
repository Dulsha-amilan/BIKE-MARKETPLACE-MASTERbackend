"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VehiclesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const frontend_seed_1 = require("../seed/frontend-seed");
const firebase_service_1 = require("../firebase/firebase.service");
let VehiclesService = VehiclesService_1 = class VehiclesService {
    firebase;
    logger = new common_1.Logger(VehiclesService_1.name);
    seedVehicles = [];
    userVehicles = [];
    vehiclesCollection = process.env.VEHICLES_COLLECTION || 'vehicles';
    constructor(firebase) {
        this.firebase = firebase;
    }
    async onModuleInit() {
        const seed = await (0, frontend_seed_1.loadFrontendSeed)();
        this.seedVehicles = (seed.sampleVehicles || []).map((v) => ({
            ...v,
            source: 'seed',
        }));
        await this.loadUserVehiclesFromFirestore();
    }
    listAll() {
        const merged = [...this.userVehicles, ...this.seedVehicles];
        return merged.sort((a, b) => {
            const ta = a.postedAt ? Date.parse(a.postedAt) : 0;
            const tb = b.postedAt ? Date.parse(b.postedAt) : 0;
            return tb - ta;
        });
    }
    listUser() {
        return [...this.userVehicles].sort((a, b) => {
            const ta = a.postedAt ? Date.parse(a.postedAt) : 0;
            const tb = b.postedAt ? Date.parse(b.postedAt) : 0;
            return tb - ta;
        });
    }
    getById(id) {
        const v = this.listAll().find((x) => x.id === id);
        if (!v)
            throw new common_1.NotFoundException('Vehicle not found');
        return v;
    }
    async create(dto) {
        const now = new Date().toISOString();
        const make = (dto.make || '').trim();
        const model = (dto.model || '').trim();
        const title = (dto.title || '').trim() || `${make} ${model}`.trim() || 'Untitled Vehicle';
        const id = `user-${slugify(`${make}-${model}`)}-${Date.now()}-${(0, node_crypto_1.randomUUID)().slice(0, 6)}`;
        const gallery = Array.isArray(dto.gallery) ? dto.gallery.filter(Boolean) : [];
        const image = dto.image || gallery[0] || '';
        const v = {
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
    async update(id, patch) {
        const idx = this.userVehicles.findIndex((v) => v.id === id);
        if (idx === -1) {
            if (this.seedVehicles.some((v) => v.id === id)) {
                throw new common_1.ForbiddenException('Seed vehicles are read-only');
            }
            throw new common_1.NotFoundException('Vehicle not found');
        }
        const prev = this.userVehicles[idx];
        const next = {
            ...prev,
            ...patch,
            source: 'user',
        };
        this.userVehicles = this.userVehicles.map((v) => (v.id === id ? next : v));
        await this.saveUserVehicle(next);
        return next;
    }
    async remove(id) {
        const before = this.userVehicles.length;
        this.userVehicles = this.userVehicles.filter((v) => v.id !== id);
        if (this.userVehicles.length === before) {
            if (this.seedVehicles.some((v) => v.id === id)) {
                throw new common_1.ForbiddenException('Seed vehicles are read-only');
            }
            throw new common_1.NotFoundException('Vehicle not found');
        }
        await this.deleteUserVehicle(id);
    }
    async saveUserVehicle(vehicle) {
        const v = { ...vehicle, source: 'user' };
        try {
            const db = await this.firebase.firestore();
            await db
                .collection(this.vehiclesCollection)
                .doc(v.id)
                .set(stripUndefined(v), { merge: true });
        }
        catch (err) {
            this.logger.error('Failed writing vehicle to Firestore', err);
            throw err;
        }
    }
    async deleteUserVehicle(id) {
        try {
            const db = await this.firebase.firestore();
            await db.collection(this.vehiclesCollection).doc(id).delete();
        }
        catch (err) {
            this.logger.error('Failed deleting vehicle from Firestore', err);
            throw err;
        }
    }
    async loadUserVehiclesFromFirestore() {
        try {
            const db = await this.firebase.firestore();
            const snap = await db.collection(this.vehiclesCollection).get();
            const vehicles = snap.docs
                .map((d) => {
                const data = d.data() || {};
                const id = String(data.id || d.id);
                return {
                    ...data,
                    id,
                    source: 'user',
                };
            })
                .filter((v) => v && v.id);
            this.userVehicles = vehicles;
        }
        catch (err) {
            this.logger.error('Firestore is not available (check FIREBASE_SERVICE_ACCOUNT_PATH / FIREBASE_SERVICE_ACCOUNT_JSON).', err);
            this.userVehicles = [];
        }
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = VehiclesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], VehiclesService);
function slugify(input) {
    return (input || 'vehicle')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 50);
}
function stripUndefined(obj) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined)
            out[k] = v;
    }
    return out;
}
//# sourceMappingURL=vehicles.service.js.map