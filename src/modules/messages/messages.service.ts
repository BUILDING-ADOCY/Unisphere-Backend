// --- src/modules/messages/message.service.ts ---
import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    BadRequestException,
    Logger,
  } from '@nestjs/common';
  import { DBService } from 'src/database/db.service';
  import { AiService } from '../ai/ai.service';
  import { MessageEntity } from './entities/message.entity';
  import { toPgVector } from 'src/utils/pgvector';
  
  @Injectable()
  export class MessageService {
    private readonly logger = new Logger(MessageService.name);
    private readonly BOT_USER_ID = 2;  // <— ensure this user actually exists in `users`
  
    constructor(
      private readonly db: DBService,
      private readonly ai: AiService,
    ) {}
  
    async handleSendMessage(
      userId: number,
      chatId: number,
      content: string
    ): Promise<MessageEntity> {
      this.logger.log(`handleSendMessage: user=${userId}, chat=${chatId}`);
  
      // ─── 0) Verify that the given userId & chatId actually exist ──────────────
      const [userRow] = await this.db.query<{ id: number }>(
        `SELECT id FROM users WHERE id = $1`, [userId]
      );
      if (!userRow) {
        throw new NotFoundException(`User ${userId} not found`);
      }
  
      const [chatRow] = await this.db.query<{ id: number }>(
        `SELECT id FROM chats WHERE id = $1`, [chatId]
      );
      if (!chatRow) {
        throw new NotFoundException(`Chat ${chatId} not found`);
      }
  
      try {
        // 1) embed user content
        const userEmbedding = await this.ai.embed(content);
        if (!Array.isArray(userEmbedding) || userEmbedding.length !== 1536) {
          throw new Error('Invalid user embedding');
        }
  
        // 2) generate AI reply
        const reply = await this.ai.generateReply(content);
  
        // 3) embed reply
        const replyEmbedding = await this.ai.embed(reply);
        if (!Array.isArray(replyEmbedding) || replyEmbedding.length !== 1536) {
          throw new Error('Invalid reply embedding');
        }
  
        // 4) cast arrays to pgvector literals
        const userVec  = toPgVector(userEmbedding);
        const replyVec = toPgVector(replyEmbedding);
  
        // 5) store user message
        await this.db.query(
          `INSERT INTO messages (chat_id, sender_id, content, embedding)
           VALUES ($1, $2, $3, $4::vector)`,
          [chatId, userId, content, userVec],
        );
        this.logger.debug('✅ User message stored');
  
        // 6) store AI reply
        const [aiMsg] = await this.db.query<MessageEntity>(
          `INSERT INTO messages (chat_id, sender_id, content, embedding)
           VALUES ($1, $2, $3, $4::vector)
           RETURNING *`,
          [chatId, this.BOT_USER_ID, reply, replyVec],
        );
        this.logger.log(`✅ AI reply stored (id=${aiMsg.id})`);
  
        return aiMsg;
      } catch (err: any) {
        // If it's a foreign‐key violation, surface a clear 400
        if (err.code === '23503') {
          throw new BadRequestException('Invalid userId or chatId in INSERT');
        }
        this.logger.error('handleSendMessage failed', err.stack || err.message);
        throw new InternalServerErrorException('Message processing failed');
      }
    }
  /**
   * Finds the top‑N similar messages by vector distance.
   */
  async searchSimilarMessages(
    content: string,
    limit = 5
  ): Promise<MessageEntity[]> {
    this.logger.log(`searchSimilarMessages: "${content}"`);

    try {
      const embedding = await this.ai.embed(content);
      if (!Array.isArray(embedding) || embedding.length !== 1536) {
        throw new Error('Invalid search embedding');
      }
      const vec = toPgVector(embedding);

      const sql = `
        SELECT *
         FROM messages
         ORDER BY embedding <-> $1::vector
         LIMIT $2
      `;
      const rows = await this.db.query<MessageEntity>(sql, [vec, limit]);

      this.logger.log(`Found ${rows.length} similar messages`);
      return rows;
    } catch (err) {
      this.logger.error('searchSimilarMessages failed', err.stack || err.message);
      throw new InternalServerErrorException('Search failed');
    }
  }
}