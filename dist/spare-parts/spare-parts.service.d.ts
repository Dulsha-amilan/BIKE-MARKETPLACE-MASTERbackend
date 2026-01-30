export declare class SparePartsService {
    private parts;
    onModuleInit(): Promise<void>;
    list(filters?: {
        category?: string;
        brand?: string;
        condition?: string;
    }): any[];
}
