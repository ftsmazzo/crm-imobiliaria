import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

/** Limite: 5 envios por IP a cada 60 segundos para POST /api/public/lead */
const TTL_MS = 60 * 1000;
const MAX_REQUESTS = 5;

const contagemPorIp = new Map<string, { count: number; resetAt: number }>();

function limparExpirados() {
  const now = Date.now();
  for (const [ip, data] of contagemPorIp.entries()) {
    if (data.resetAt <= now) contagemPorIp.delete(ip);
  }
}

@Injectable()
export class LeadRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.ip ||
      request.socket?.remoteAddress ||
      'unknown';

    limparExpirados();

    const now = Date.now();
    let data = contagemPorIp.get(ip);

    if (!data) {
      data = { count: 1, resetAt: now + TTL_MS };
      contagemPorIp.set(ip, data);
      return true;
    }

    if (data.resetAt <= now) {
      data.count = 1;
      data.resetAt = now + TTL_MS;
      return true;
    }

    data.count += 1;
    if (data.count > MAX_REQUESTS) {
      throw new HttpException(
        { message: 'Muitas tentativas. Tente novamente em alguns minutos.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
