import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ContatosModule } from './contatos/contatos.module';
import { ImoveisModule } from './imoveis/imoveis.module';
import { PublicModule } from './public/public.module';
import { TarefasModule } from './tarefas/tarefas.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, ContatosModule, ImoveisModule, TarefasModule, PublicModule],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
