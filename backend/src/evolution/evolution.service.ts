import { Injectable } from '@nestjs/common';

/**
 * Envia mensagens WhatsApp via Evolution API.
 * Configure: EVOLUTION_API_URL, EVOLUTION_INSTANCE e opcionalmente EVOLUTION_API_KEY.
 */
@Injectable()
export class EvolutionService {
  private get baseUrl(): string {
    const url = process.env.EVOLUTION_API_URL?.trim();
    if (!url) return '';
    return url.replace(/\/$/, '');
  }

  private get instance(): string {
    return process.env.EVOLUTION_INSTANCE?.trim() || 'default';
  }

  private get apiKey(): string | undefined {
    return process.env.EVOLUTION_API_KEY?.trim();
  }

  /** Verifica se a Evolution está configurada para envio. */
  isConfigured(): boolean {
    return !!this.baseUrl;
  }

  /**
   * Normaliza número para o formato esperado (ex: 5511999999999).
   * Remove espaços, parênteses e hífens.
   */
  private normalizarNumero(telefone: string): string {
    const digits = telefone.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 11 && !digits.startsWith('55')) {
      return '55' + digits;
    }
    return digits;
  }

  /**
   * Envia mensagem de texto via Evolution API.
   * @param numero Número com DDD (ex: 11999999999 ou 5511999999999)
   * @param texto Conteúdo da mensagem
   * @returns true se enviado com sucesso, false se falhou ou Evolution não configurada
   */
  async sendText(numero: string, texto: string): Promise<boolean> {
    if (!this.baseUrl) {
      return false;
    }
    const number = this.normalizarNumero(numero);
    if (number.length < 10) {
      return false;
    }
    const url = `${this.baseUrl}/message/sendText/${this.instance}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['apikey'] = this.apiKey;
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ number, text: texto }),
      });
      return res.ok || res.status === 201;
    } catch {
      return false;
    }
  }

  /**
   * Configura na Evolution API o webhook para a instância atual (MESSAGES_UPSERT).
   * Usado para que, quando alguém responder no WhatsApp, a Evolution chame nosso backend.
   * @param webhookUrl URL completa que a Evolution deve chamar (ex.: https://seu-backend/imoveis/webhook/evolution-messages-upsert)
   */
  async setWebhook(webhookUrl: string): Promise<{ ok: boolean; message?: string; erro?: string }> {
    if (!this.baseUrl) {
      return { ok: false, erro: 'Evolution API não configurada (EVOLUTION_API_URL)' };
    }
    const url = `${this.baseUrl}/webhook/set/${encodeURIComponent(this.instance)}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['apikey'] = this.apiKey;
    }
    const body = {
      enabled: true,
      url: webhookUrl.trim().replace(/\/$/, ''),
      webhookByEvents: false,
      webhookBase64: false,
      events: ['MESSAGES_UPSERT'],
    };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || res.status === 201) {
        return { ok: true, message: 'Webhook configurado na Evolution. Ao responder no WhatsApp, o status será atualizado.' };
      }
      return {
        ok: false,
        erro: (data as { message?: string })?.message || data?.error || `Evolution API retornou ${res.status}`,
      };
    } catch (e) {
      return { ok: false, erro: e instanceof Error ? e.message : 'Erro ao chamar Evolution API' };
    }
  }
}
