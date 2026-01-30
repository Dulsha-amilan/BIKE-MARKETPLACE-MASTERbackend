import { Vehicle } from './vehicle.model';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { FirebaseService } from '../firebase/firebase.service';
export declare class VehiclesService {
    private readonly firebase;
    private readonly logger;
    private seedVehicles;
    private userVehicles;
    private usingFirestore;
    private readonly vehiclesCollection;
    private readonly persistence;
    private readonly store;
    constructor(firebase: FirebaseService);
    onModuleInit(): Promise<void>;
    listAll(): Vehicle[];
    listUser(): Vehicle[];
    getById(id: string): Vehicle;
    create(dto: CreateVehicleDto): Promise<Vehicle>;
    update(id: string, patch: UpdateVehicleDto): Promise<Vehicle>;
    remove(id: string): Promise<void>;
    private saveUserVehicle;
    private deleteUserVehicle;
    private persistFile;
    private loadUserVehiclesFromFile;
    private tryLoadUserVehiclesFromFirestore;
}
