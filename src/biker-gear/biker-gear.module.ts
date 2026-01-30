import { Module } from '@nestjs/common';
import { BikerGearController } from './biker-gear.controller';
import { BikerGearService } from './biker-gear.service';

@Module({
  controllers: [BikerGearController],
  providers: [BikerGearService],
})
export class BikerGearModule {}
