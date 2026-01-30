import { Controller, Get, Query } from '@nestjs/common';
import { SparePartsService } from './spare-parts.service';

@Controller('spare-parts')
export class SparePartsController {
  constructor(private readonly spareParts: SparePartsService) {}

  @Get()
  list(
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('condition') condition?: string,
  ) {
    return this.spareParts.list({ category, brand, condition });
  }
}
