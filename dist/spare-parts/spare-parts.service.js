"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparePartsService = void 0;
const common_1 = require("@nestjs/common");
const frontend_seed_1 = require("../seed/frontend-seed");
let SparePartsService = class SparePartsService {
    parts = [];
    async onModuleInit() {
        const seed = await (0, frontend_seed_1.loadFrontendSeed)();
        this.parts = Array.isArray(seed.sparePartsData) ? seed.sparePartsData : [];
    }
    list(filters) {
        const category = filters?.category?.toLowerCase();
        const brand = filters?.brand?.toLowerCase();
        const condition = filters?.condition?.toLowerCase();
        return this.parts.filter((p) => {
            const categoryOk = !category || String(p.category || '').toLowerCase() === category;
            const brandOk = !brand || String(p.brand || '').toLowerCase().includes(brand);
            const conditionOk = !condition || String(p.condition || '').toLowerCase() === condition;
            return categoryOk && brandOk && conditionOk;
        });
    }
};
exports.SparePartsService = SparePartsService;
exports.SparePartsService = SparePartsService = __decorate([
    (0, common_1.Injectable)()
], SparePartsService);
//# sourceMappingURL=spare-parts.service.js.map