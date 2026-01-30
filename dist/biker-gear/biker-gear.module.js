"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BikerGearModule = void 0;
const common_1 = require("@nestjs/common");
const biker_gear_controller_1 = require("./biker-gear.controller");
const biker_gear_service_1 = require("./biker-gear.service");
let BikerGearModule = class BikerGearModule {
};
exports.BikerGearModule = BikerGearModule;
exports.BikerGearModule = BikerGearModule = __decorate([
    (0, common_1.Module)({
        controllers: [biker_gear_controller_1.BikerGearController],
        providers: [biker_gear_service_1.BikerGearService],
    })
], BikerGearModule);
//# sourceMappingURL=biker-gear.module.js.map