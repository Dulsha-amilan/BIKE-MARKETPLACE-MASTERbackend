import { Injectable } from '@nestjs/common';
import { loadFrontendSeed } from '../seed/frontend-seed';

@Injectable()
export class SparePartsService {
  private parts: any[] = [];

  async onModuleInit() {
    const seed = await loadFrontendSeed();
    this.parts = Array.isArray(seed.sparePartsData) ? seed.sparePartsData : [];
  }

  list(filters?: { category?: string; brand?: string; condition?: string }) {
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
}
