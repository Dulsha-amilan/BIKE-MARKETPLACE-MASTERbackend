export declare class BikerGearService {
    private gear;
    onModuleInit(): Promise<void>;
    list(filters?: {
        category?: string;
        brand?: string;
        condition?: string;
        size?: string;
    }): any[];
}
