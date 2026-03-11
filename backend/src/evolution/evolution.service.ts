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
}
