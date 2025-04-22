// src/modules/chat/chat.service.ts

import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { ChatResponseDto } from './dto/chat-response.dto';

@Injectable()
export class ChatService {
  constructor(private readonly aiService: AiService) {}

  async generateResponse(message: string): Promise<ChatResponseDto> {
    const reply = await this.aiService.generateReply(message);
    return new ChatResponseDto(reply);
  }
}
