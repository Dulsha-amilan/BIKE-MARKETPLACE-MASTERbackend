import { FirebaseService } from './firebase.service';
export declare class FirebaseController {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    health(): Promise<{
        ok: boolean;
        now: string;
    }>;
}
