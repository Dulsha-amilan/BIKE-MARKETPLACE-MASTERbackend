"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BikerGearService = void 0;
const common_1 = require("@nestjs/common");
const frontend_seed_1 = require("../seed/frontend-seed");
let BikerGearService = class BikerGearService {
    gear = [];
    async onModuleInit() {
        const seed = await (0, frontend_seed_1.loadFrontendSeed)();
        this.gear = Array.isArray(seed.bikerGearData) ? seed.bikerGearData : [];
    }
    list(filters) {
        const category = filters?.category?.toLowerCase();
        const brand = filters?.brand?.toLowerCase();
        const condition = filters?.condition?.toLowerCase();
        const size = filters?.size?.toLowerCase();
        return this.gear.filter((g) => {
            const categoryOk = !category || String(g.category || '').toLowerCase() === category;
            const brandOk = !brand || String(g.brand || '').toLowerCase().includes(brand);
            const conditionOk = !condition || String(g.condition || '').toLowerCase() === condition;
            const sizeOk = !size || String(g.size || '').toLowerCase() === size;
            return categoryOk && brandOk && conditionOk && sizeOk;
        });
    }
};
exports.BikerGearService = BikerGearService;
exports.BikerGearService = BikerGearService = __decorate([
    (0, common_1.Injectable)()
], BikerGearService);
//# sourceMappingURL=biker-gear.service.js.map