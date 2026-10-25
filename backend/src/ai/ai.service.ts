import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly groq: Groq;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService
      .get<string>('GROQ_API_KEY')
      ?.trim() || process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error('GROQ_API_KEY is missing from environment variables');
    }

    this.groq = new Groq({ apiKey });

 
    this.model =
      this.configService.get<string>('GROQ_MODEL')?.trim() ||
      process.env.GROQ_MODEL ||
      'openai/gpt-oss-120b';
  }

  async chatWithAI(prompt: string): Promise<{ reply: string }> {
    const question = prompt?.trim();

    if (!question) {
      throw new BadRequestException('Question cannot be empty');
    }

    try {
      const completion = await this.groq.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `
You are a highly capable, accurate, and natural AI assistant like ChatGPT.

LANGUAGE:
- Reply in the same language as the user's question.
- For Arabic, use clear, natural, well-formatted Arabic.
- If the user writes Egyptian Arabic, reply in Egyptian Arabic.
- For English, reply in English.

ANSWER QUALITY:
- Answer the actual question directly and accurately.
- Never use predefined answers or canned responses.
- Never add unrelated information.
- Do not mention ShelfLoop, books, library data, or contact details unless explicitly asked.
- Do not recommend books unless user asks.
- Be concise for simple questions, detailed for complex ones.
- Never invent facts.

FORMATTING - CRITICAL:
- Format every answer as clean, readable Markdown.
- ALWAYS put a blank line between paragraphs.
- Use headings (###) only when answer has multiple sections.
- For let vs const type questions:
  - Use separate paragraphs for each point.
  - Put code examples in fenced blocks with language.
  - Example:
    ### الفرق بين let و const

    **1. النطاق (Scope):**
    - \`let\` و \`const\` هما block-scoped.
    - \`var\` هو function-scoped.

    **2. إعادة التعيين:**
    \`\`\`javascript
    let a = 1;
    a = 2; // مسموح 
    const b = 3;
    b = 4; // خطأ 
    \`\`\`

- Use bullet points (-) for lists.
- Use **bold** for important terms.
- Use \`inline code\` for variables/functions.
- Put multi-line code in \`\`\`language blocks.
- Never put entire answer in one paragraph.
- Keep Arabic and English code separated - code blocks always LTR.

Return only the answer, no explanation of rules.
            `.trim(),
          },
          {
            role: 'user',
            content: question,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const reply = completion.choices[0]?.message?.content?.trim();

      if (!reply) {
        throw new Error('Groq returned empty response');
      }

      return { reply };
    } catch (error: any) {
      this.logger.error(`Groq failed: ${error.message}`);
      
      try {
        const fallback = await this.groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are helpful assistant. Answer directly in same language.' },
            { role: 'user', content: question }
          ],
          temperature: 0.3,
          max_tokens: 1200,
        });
        const reply2 = fallback.choices[0]?.message?.content?.trim();
        if (reply2) return { reply: reply2 };
      } catch {}

      throw new ServiceUnavailableException('AI service temporarily unavailable. Try again.');
    }
  }
}
