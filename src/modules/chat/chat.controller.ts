import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(200)
  async handleMessage(@Body() dto: SendMessageDto): Promise<ChatResponseDto> {
    return this.chatService.generateResponse(dto.message);
  }
}
