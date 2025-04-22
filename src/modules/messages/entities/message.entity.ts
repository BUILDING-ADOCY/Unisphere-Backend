// src/modules/messages/entities/message.entity.ts
import { ApiProperty } from '@nestjs/swagger';

export class MessageEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  chat_id: number;

  @ApiProperty()
  sender_id: number;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: [Number], description: '1536-dimensional vector' })
  embedding: number[];

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
