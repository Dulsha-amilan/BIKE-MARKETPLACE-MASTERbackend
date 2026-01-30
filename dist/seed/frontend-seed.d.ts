export type FrontendSeed = {
    sampleVehicles: any[];
    sparePartsData: any[];
    bikerGearData: any[];
    chatbotResponses: Record<string, any>;
};
export declare function loadFrontendSeed(): Promise<FrontendSeed>;
