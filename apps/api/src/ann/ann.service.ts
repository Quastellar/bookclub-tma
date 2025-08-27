import { Injectable } from '@nestjs/common';

@Injectable()
export class AnnService {
  private apiBase(token: string) {
    return `https://api.telegram.org/bot${token}`;
  }

  async sendMessage(params: {
    token: string;
    chatId: string; // "@channelusername" или числовой id
    text: string;
    parseMode?: 'Markdown' | 'HTML';
    replyMarkup?: any;
    disableWebPagePreview?: boolean;
  }) {
    const url = `${this.apiBase(params.token)}/sendMessage`;
    const body = {
      chat_id: params.chatId,
      text: params.text,
      parse_mode: params.parseMode || 'Markdown',
      reply_markup: params.replyMarkup,
      disable_web_page_preview: params.disableWebPagePreview ?? false,
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.ok) {
      throw new Error(`Telegram error: ${json.description || res.status}`);
    }
    return json.result;
  }
}
