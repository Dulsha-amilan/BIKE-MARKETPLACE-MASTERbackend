import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
export declare class VehiclesController {
    private readonly vehicles;
    constructor(vehicles: VehiclesService);
    list(source?: 'seed' | 'user'): import("./vehicle.model").Vehicle[];
    getOne(id: string): import("./vehicle.model").Vehicle;
    createJson(dto: CreateVehicleDto): Promise<import("./vehicle.model").Vehicle>;
    createUpload(dto: CreateVehicleDto, files: {
        hero?: Express.Multer.File[];
        gallery?: Express.Multer.File[];
    }): Promise<import("./vehicle.model").Vehicle>;
    update(id: string, dto: UpdateVehicleDto): Promise<import("./vehicle.model").Vehicle>;
    remove(id: string): Promise<{
        ok: boolean;
    }>;
}
