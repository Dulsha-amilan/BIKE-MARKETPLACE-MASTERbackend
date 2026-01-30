import { Controller, Get } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbot: ChatbotService) {}

  @Get('responses')
  getResponses() {
    return this.chatbot.getResponses();
  }
}
