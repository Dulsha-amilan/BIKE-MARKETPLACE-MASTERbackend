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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFrontendSeed = loadFrontendSeed;
const path = __importStar(require("node:path"));
const node_fs_1 = require("node:fs");
const node_vm_1 = __importDefault(require("node:vm"));
let cachedSeed = null;
async function findRepoRootFromCwd() {
    const cwd = process.cwd();
    const base = path.basename(cwd).toLowerCase();
    let candidate = cwd;
    if (base === 'backend')
        candidate = path.resolve(cwd, '..');
    if (base === 'dist' && path.basename(path.resolve(cwd, '..')).toLowerCase() === 'backend') {
        candidate = path.resolve(cwd, '../..');
    }
    const target = path.join('src', 'data', 'sampleVehicles.js');
    let root = candidate;
    for (let i = 0; i < 6; i++) {
        try {
            await node_fs_1.promises.access(path.join(root, target));
            return root;
        }
        catch {
        }
        root = path.resolve(root, '..');
    }
    return candidate;
}
async function loadNamedExport(relativeToRepoRoot, exportName) {
    const abs = path.join(await findRepoRootFromCwd(), relativeToRepoRoot);
    const code = await node_fs_1.promises.readFile(abs, 'utf8');
    const transformed = code
        .replace(/export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+=/g, 'exports.$1 =')
        .replace(/export\s+default\s+/g, 'exports.default = ');
    const context = node_vm_1.default.createContext({ exports: {} });
    node_vm_1.default.runInContext(transformed, context, { filename: abs, timeout: 1000 });
    return context.exports[exportName];
}
async function loadFrontendSeed() {
    if (cachedSeed)
        return cachedSeed;
    const [sampleVehicles, sparePartsData, bikerGearData, chatbotResponses] = await Promise.all([
        loadNamedExport('src/data/sampleVehicles.js', 'sampleVehicles'),
        loadNamedExport('src/data/sparePartsData.js', 'sparePartsData'),
        loadNamedExport('src/data/bikerGearData.js', 'bikerGearData'),
        loadNamedExport('src/data/chatbotData.js', 'chatbotResponses'),
    ]);
    cachedSeed = {
        sampleVehicles: Array.isArray(sampleVehicles) ? sampleVehicles : [],
        sparePartsData: Array.isArray(sparePartsData) ? sparePartsData : [],
        bikerGearData: Array.isArray(bikerGearData) ? bikerGearData : [],
        chatbotResponses: chatbotResponses ?? {},
    };
    return cachedSeed;
}
//# sourceMappingURL=frontend-seed.js.map