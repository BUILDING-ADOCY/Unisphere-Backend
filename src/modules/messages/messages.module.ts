import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessageService } from './messages.service';
import { DBService } from 'src/database/db.service';
import { AiService } from '../ai/ai.service';

@Module({
  controllers: [MessagesController],
  providers: [MessageService, DBService, AiService],
})
export class MessagesModule {}
