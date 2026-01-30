import { SparePartsService } from './spare-parts.service';
export declare class SparePartsController {
    private readonly spareParts;
    constructor(spareParts: SparePartsService);
    list(category?: string, brand?: string, condition?: string): any[];
}
