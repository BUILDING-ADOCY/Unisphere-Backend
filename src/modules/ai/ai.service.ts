import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly model = 'openai/gpt-4o';

  async generateReply(message: string): Promise<string> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: this.model,
          messages: [
            { role: 'user', content: message },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:8888',
            'X-Title': process.env.OPENROUTER_TITLE || 'Unisphere Chatbot',
          },
        }
      );

      const content = response.data.choices?.[0]?.message?.content;
      const fallback = response.data.choices?.[0]?.text;
      return content || fallback || '🤖 No response from AI.';
    } catch (error) {
      console.error('🔴 OpenRouter API Error:', error.response?.data || error.message);
      return '❌ Failed to connect to OpenRouter.';
    }
  }

  async embed(content: string): Promise<number[]> {
    // Simulated version (replace with ARAG call later)
    return Array.from({ length: 1536 }, () => Math.random());
  }
}
