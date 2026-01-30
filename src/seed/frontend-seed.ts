import * as path from 'node:path';
import { promises as fs } from 'node:fs';
import vm from 'node:vm';

export type FrontendSeed = {
  sampleVehicles: any[];
  sparePartsData: any[];
  bikerGearData: any[];
  chatbotResponses: Record<string, any>;
};

let cachedSeed: FrontendSeed | null = null;

function isErrnoWithCode(err: unknown, code: string): boolean {
  return typeof err === 'object' && err !== null && (err as any).code === code;
}

async function findRepoRootFromCwd(): Promise<string> {
  // Expected layouts:
  // - repoRoot/ (contains src/)
  // - repoRoot/backend/ (NestJS project)
  // - repoRoot/backend/dist/ (compiled output)

  const cwd = process.cwd();
  const base = path.basename(cwd).toLowerCase();

  let candidate = cwd;
  if (base === 'backend') candidate = path.resolve(cwd, '..');
  if (base === 'dist' && path.basename(path.resolve(cwd, '..')).toLowerCase() === 'backend') {
    candidate = path.resolve(cwd, '../..');
  }

  const target = path.join('src', 'data', 'sampleVehicles.js');
  let root = candidate;
  for (let i = 0; i < 6; i++) {
    try {
      await fs.access(path.join(root, target));
      return root;
    } catch {
      // keep walking up
    }

    root = path.resolve(root, '..');
  }

  // Best-effort fallback
  return candidate;
}

async function loadNamedExport<T = any>(relativeToRepoRoot: string, exportName: string): Promise<T> {
  const abs = path.join(await findRepoRootFromCwd(), relativeToRepoRoot);
  const code = await fs.readFile(abs, 'utf8');

  // Transform ESM `export const X = ...` into CJS-ish `exports.X = ...`
  const transformed = code
    .replace(/export\s+const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s+=/g, 'exports.$1 =')
    .replace(/export\s+default\s+/g, 'exports.default = ');

  const context = vm.createContext({ exports: {} as any });
  vm.runInContext(transformed, context, { filename: abs, timeout: 1000 });

  return (context as any).exports[exportName] as T;
}

async function loadNamedExportOptional<T>(
  relativeToRepoRoot: string,
  exportName: string,
  fallback: T,
): Promise<T> {
  try {
    return await loadNamedExport<T>(relativeToRepoRoot, exportName);
  } catch (err) {
    if (isErrnoWithCode(err, 'ENOENT')) return fallback;
    throw err;
  }
}

export async function loadFrontendSeed(): Promise<FrontendSeed> {
  if (cachedSeed) return cachedSeed;

  const [sampleVehicles, sparePartsData, bikerGearData, chatbotResponses] =
    await Promise.all([
      loadNamedExportOptional<any[]>('src/data/sampleVehicles.js', 'sampleVehicles', []),
      loadNamedExportOptional<any[]>('src/data/sparePartsData.js', 'sparePartsData', []),
      loadNamedExportOptional<any[]>('src/data/bikerGearData.js', 'bikerGearData', []),
      loadNamedExportOptional<Record<string, any>>('src/data/chatbotData.js', 'chatbotResponses', {}),
    ]);

  cachedSeed = {
    sampleVehicles: Array.isArray(sampleVehicles) ? sampleVehicles : [],
    sparePartsData: Array.isArray(sparePartsData) ? sparePartsData : [],
    bikerGearData: Array.isArray(bikerGearData) ? bikerGearData : [],
    chatbotResponses: chatbotResponses ?? {},
  };

  return cachedSeed;
}
