"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = __importStar(require("node:path"));
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const vehicles_service_1 = require("./vehicles.service");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const update_vehicle_dto_1 = require("./dto/update-vehicle.dto");
let VehiclesController = class VehiclesController {
    vehicles;
    constructor(vehicles) {
        this.vehicles = vehicles;
    }
    list(source) {
        if (source === 'user')
            return this.vehicles.listUser();
        return this.vehicles.listAll();
    }
    getOne(id) {
        return this.vehicles.getById(id);
    }
    createJson(dto) {
        return this.vehicles.create(dto);
    }
    createUpload(dto, files) {
        const heroFiles = files?.hero || [];
        const galleryFiles = files?.gallery || [];
        const uploadedUrls = [
            ...heroFiles.map((f) => toPublicUploadUrl(f?.filename)),
            ...galleryFiles.map((f) => toPublicUploadUrl(f?.filename)),
        ].filter(Boolean);
        const finalGallery = [...uploadedUrls, ...(dto.gallery || [])].filter(Boolean);
        const finalImage = uploadedUrls[0] || dto.image || finalGallery[0] || '';
        const mergedDto = {
            ...dto,
            image: finalImage,
            gallery: finalGallery,
        };
        return this.vehicles.create(mergedDto);
    }
    update(id, dto) {
        return this.vehicles.update(id, dto);
    }
    async remove(id) {
        await this.vehicles.remove(id);
        return { ok: true };
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('source')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_dto_1.CreateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "createJson", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'hero', maxCount: 1 },
        { name: 'gallery', maxCount: 3 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: async (_req, _file, cb) => {
                try {
                    const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
                    const dest = path.resolve(process.cwd(), uploadsDir, 'vehicles');
                    await node_fs_1.promises.mkdir(dest, { recursive: true });
                    cb(null, dest);
                }
                catch (e) {
                    cb(e, path.resolve(process.cwd(), 'uploads', 'vehicles'));
                }
            },
            filename: (_req, file, cb) => {
                const ext = path.extname(file.originalname || '').slice(0, 10);
                cb(null, `${Date.now()}-${(0, node_crypto_1.randomUUID)().slice(0, 8)}${ext}`);
            },
        }),
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_dto_1.CreateVehicleDto, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "createUpload", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_dto_1.UpdateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "remove", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, common_1.Controller)('vehicles'),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService])
], VehiclesController);
function toPublicUploadUrl(filename) {
    if (!filename)
        return '';
    return `/uploads/vehicles/${encodeURIComponent(filename)}`;
}
//# sourceMappingURL=vehicles.controller.js.map