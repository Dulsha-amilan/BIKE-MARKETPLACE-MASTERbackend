import { Injectable } from '@nestjs/common';
import { loadFrontendSeed } from '../seed/frontend-seed';

@Injectable()
export class BikerGearService {
  private gear: any[] = [];

  async onModuleInit() {
    const seed = await loadFrontendSeed();
    this.gear = Array.isArray(seed.bikerGearData) ? seed.bikerGearData : [];
  }

  list(filters?: { category?: string; brand?: string; condition?: string; size?: string }) {
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
}
