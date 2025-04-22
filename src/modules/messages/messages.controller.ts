import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessageService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { SearchMessageDto } from './dto/search-message.dto';
import { MessageEntity } from './entities/message.entity';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessageService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a message and get AI reply' })
  @ApiOkResponse({ description: 'AI reply returned successfully', type: MessageEntity })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async send(@Body() body: SendMessageDto) {
    return this.messageService.handleSendMessage(body.userId, body.chatId, body.content);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search for similar messages using embeddings' })
  @ApiOkResponse({ description: 'List of similar messages', type: [MessageEntity] })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async search(@Body() body: SearchMessageDto) {
    return this.messageService.searchSimilarMessages(body.content);
  }
}
