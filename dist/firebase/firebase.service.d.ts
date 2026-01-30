import * as admin from 'firebase-admin';
export declare class FirebaseService {
    private app;
    getApp(): Promise<admin.app.App>;
    firestore(): Promise<admin.firestore.Firestore>;
    private tryInitFromServiceAccountPath;
    private tryInitFromServiceAccountJson;
}
