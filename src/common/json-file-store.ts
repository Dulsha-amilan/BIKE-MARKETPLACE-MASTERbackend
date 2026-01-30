import * as path from 'node:path';
import { promises as fs } from 'node:fs';

export class JsonFileStore<T> {
  constructor(
    private readonly filePath: string,
    private readonly defaultValue: T,
  ) {}

  async read(): Promise<T> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as T;
    } catch (err: any) {
      if (err?.code === 'ENOENT') return this.defaultValue;
      throw err;
    }
  }

  async write(value: T): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(value, null, 2), 'utf8');
  }
}
