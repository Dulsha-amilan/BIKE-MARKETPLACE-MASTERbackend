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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
const path = __importStar(require("node:path"));
const node_fs_1 = require("node:fs");
let FirebaseService = class FirebaseService {
    app = null;
    async getApp() {
        if (this.app)
            return this.app;
        const fromJsonString = await this.tryInitFromServiceAccountJson();
        if (fromJsonString)
            return fromJsonString;
        const fromPath = await this.tryInitFromServiceAccountPath();
        if (fromPath)
            return fromPath;
        this.app = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
        return this.app;
    }
    async firestore() {
        const app = await this.getApp();
        return app.firestore();
    }
    async tryInitFromServiceAccountPath() {
        const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
        if (!p)
            return null;
        const resolved = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
        console.log('[DEBUG] FIREBASE_SERVICE_ACCOUNT_PATH:', p);
        console.log('[DEBUG] Resolved Service Account Path:', resolved);
        try {
            const raw = await node_fs_1.promises.readFile(resolved, 'utf8');
            const json = JSON.parse(raw);
            this.app = admin.initializeApp({
                credential: admin.credential.cert(json),
            });
            console.log('[DEBUG] Firebase App Initialized from Path');
            return this.app;
        }
        catch (e) {
            console.error('[DEBUG] Failed to init Firebase from path:', e);
            return null;
        }
    }
    async tryInitFromServiceAccountJson() {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (!raw)
            return null;
        try {
            const json = JSON.parse(raw);
            this.app = admin.initializeApp({
                credential: admin.credential.cert(json),
            });
            return this.app;
        }
        catch {
            return null;
        }
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map