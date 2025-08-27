import { Body, Controller, Post } from '@nestjs/common';
import { AnnService } from './ann.service';
import { ConfigService } from '@nestjs/config';

@Controller('ann')
export class AnnController {
  constructor(private ann: AnnService, private cfg: ConfigService) {}

  @Post('preview')
  async preview(@Body() dto: { chatId: string; text: string; parseMode?: 'Markdown' | 'HTML'; buttons?: { text: string; url?: string; cb?: string }[][] }) {
    const token = this.cfg.get<string>('TELEGRAM_BOT_TOKEN')!;
    const replyMarkup = dto.buttons
      ? { inline_keyboard: dto.buttons.map(row => row.map(b => ({ text: b.text, url: b.url, callback_data: b.cb }))) }
      : undefined;
    // Для предпросмотра можно отправлять себе/в тестовый чат
    return this.ann.sendMessage({
      token,
      chatId: dto.chatId,
      text: dto.text,
      parseMode: dto.parseMode || 'Markdown',
      replyMarkup,
      disableWebPagePreview: false,
    });
  }

  @Post('publish')
  async publish(@Body() dto: { channelUsername: string; text: string; parseMode?: 'Markdown' | 'HTML'; buttons?: { text: string; url?: string }[][] }) {
    const token = this.cfg.get<string>('TELEGRAM_BOT_TOKEN')!;
    const replyMarkup = dto.buttons
      ? { inline_keyboard: dto.buttons.map(row => row.map(b => ({ text: b.text, url: b.url })) ) }
      : undefined;
    // В канал обязательно: бот должен быть админом этого канала
    return this.ann.sendMessage({
      token,
      chatId: '@' + dto.channelUsername.replace(/^@/, ''),
      text: dto.text,
      parseMode: dto.parseMode || 'Markdown',
      replyMarkup,
      disableWebPagePreview: false,
    });
  }
}
