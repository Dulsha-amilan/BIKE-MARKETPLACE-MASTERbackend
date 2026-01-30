import { Controller, Get, Query } from '@nestjs/common';
import { BikerGearService } from './biker-gear.service';

@Controller('biker-gear')
export class BikerGearController {
  constructor(private readonly bikerGear: BikerGearService) {}

  @Get()
  list(
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('condition') condition?: string,
    @Query('size') size?: string,
  ) {
    return this.bikerGear.list({ category, brand, condition, size });
  }
}
