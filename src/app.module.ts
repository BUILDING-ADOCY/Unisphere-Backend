import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './modules/chat/chat.module';
import { DBModule } from './database/db.module';
import { MessagesModule } from './modules/messages/messages.module';

@Module({
  imports: [ChatModule, DBModule, MessagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
