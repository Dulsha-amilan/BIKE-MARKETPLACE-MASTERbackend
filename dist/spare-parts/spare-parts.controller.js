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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparePartsController = void 0;
const common_1 = require("@nestjs/common");
const spare_parts_service_1 = require("./spare-parts.service");
let SparePartsController = class SparePartsController {
    spareParts;
    constructor(spareParts) {
        this.spareParts = spareParts;
    }
    list(category, brand, condition) {
        return this.spareParts.list({ category, brand, condition });
    }
};
exports.SparePartsController = SparePartsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('brand')),
    __param(2, (0, common_1.Query)('condition')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SparePartsController.prototype, "list", null);
exports.SparePartsController = SparePartsController = __decorate([
    (0, common_1.Controller)('spare-parts'),
    __metadata("design:paramtypes", [spare_parts_service_1.SparePartsService])
], SparePartsController);
//# sourceMappingURL=spare-parts.controller.js.map