"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const spare_parts_module_1 = require("./spare-parts/spare-parts.module");
const biker_gear_module_1 = require("./biker-gear/biker-gear.module");
const chatbot_module_1 = require("./chatbot/chatbot.module");
const firebase_module_1 = require("./firebase/firebase.module");
const firebase_controller_module_1 = require("./firebase/firebase.controller.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            firebase_module_1.FirebaseModule,
            firebase_controller_module_1.FirebaseControllerModule,
            vehicles_module_1.VehiclesModule,
            spare_parts_module_1.SparePartsModule,
            biker_gear_module_1.BikerGearModule,
            chatbot_module_1.ChatbotModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map