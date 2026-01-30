import { Controller, Get } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebase: FirebaseService) {}

  @Get('health')
  async health() {
    const db = await this.firebase.firestore();
    // Simple read that proves credentials are valid.
    // It doesn't require any collections to exist.
    const now = new Date().toISOString();
    await db.collection('_health').doc('ping').set({ now }, { merge: true });
    return { ok: true, now };
  }
}
