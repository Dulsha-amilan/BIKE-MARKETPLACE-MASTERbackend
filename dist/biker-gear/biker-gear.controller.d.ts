import { BikerGearService } from './biker-gear.service';
export declare class BikerGearController {
    private readonly bikerGear;
    constructor(bikerGear: BikerGearService);
    list(category?: string, brand?: string, condition?: string, size?: string): any[];
}
