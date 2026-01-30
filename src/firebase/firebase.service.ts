import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'node:path';
import { promises as fs } from 'node:fs';

@Injectable()
export class FirebaseService {
  private app: admin.app.App | null = null;

  async getApp(): Promise<admin.app.App> {
    if (this.app) return this.app;

    // Option A (recommended): FIREBASE_SERVICE_ACCOUNT_PATH points to the downloaded JSON key.
    // Option B: GOOGLE_APPLICATION_CREDENTIALS (ADC) also works.
    // Option C: FIREBASE_SERVICE_ACCOUNT_JSON contains the JSON string.

    const fromJsonString = await this.tryInitFromServiceAccountJson();
    if (fromJsonString) return fromJsonString;

    const fromPath = await this.tryInitFromServiceAccountPath();
    if (fromPath) return fromPath;

    // Fallback: application default credentials (works on GCP or if GOOGLE_APPLICATION_CREDENTIALS is set)
    this.app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    return this.app;
  }

  async firestore(): Promise<admin.firestore.Firestore> {
    const app = await this.getApp();
    return app.firestore();
  }

  private async tryInitFromServiceAccountPath(): Promise<admin.app.App | null> {
    const p = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!p) return null;

    const resolved = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);

    try {
      const raw = await fs.readFile(resolved, 'utf8');
      const json = JSON.parse(raw);
      this.app = admin.initializeApp({
        credential: admin.credential.cert(json),
      });
      return this.app;
    } catch {
      return null;
    }
  }

  private async tryInitFromServiceAccountJson(): Promise<admin.app.App | null> {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) return null;

    try {
      const json = JSON.parse(raw);
      this.app = admin.initializeApp({
        credential: admin.credential.cert(json),
      });
      return this.app;
    } catch {
      return null;
    }
  }
}
