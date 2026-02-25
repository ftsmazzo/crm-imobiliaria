import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ContatosModule } from './contatos/contatos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { EmpreendimentosModule } from './empreendimentos/empreendimentos.module';
import { ImoveisModule } from './imoveis/imoveis.module';
import { ProprietariosModule } from './proprietarios/proprietarios.module';
import { PublicModule } from './public/public.module';
import { StorageModule } from './storage/storage.module';
import { TarefasModule } from './tarefas/tarefas.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, StorageModule, AuthModule, HealthModule, ContatosModule, EmpreendimentosModule, ImoveisModule, ProprietariosModule, TarefasModule, PublicModule, DashboardModule],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
