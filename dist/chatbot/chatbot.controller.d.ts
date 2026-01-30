import { ChatbotService } from './chatbot.service';
export declare class ChatbotController {
    private readonly chatbot;
    constructor(chatbot: ChatbotService);
    getResponses(): Record<string, any>;
}
