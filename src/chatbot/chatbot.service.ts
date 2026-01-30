import { Injectable } from '@nestjs/common';
import { loadFrontendSeed } from '../seed/frontend-seed';

@Injectable()
export class ChatbotService {
  private responses: Record<string, any> = {};

  async onModuleInit() {
    const seed = await loadFrontendSeed();
    this.responses = seed.chatbotResponses ?? {};
  }

  getResponses() {
    return this.responses;
  }
}
