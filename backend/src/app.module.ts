import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ContatosModule } from './contatos/contatos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EvolutionModule } from './evolution/evolution.module';
import { HealthModule } from './health/health.module';
import { EmpreendimentosModule } from './empreendimentos/empreendimentos.module';
import { ImoveisModule } from './imoveis/imoveis.module';
import { ProprietariosModule } from './proprietarios/proprietarios.module';
import { ProcessoDocumentoModule } from './processo-documento/processo-documento.module';
import { PublicModule } from './public/public.module';
import { StorageModule } from './storage/storage.module';
import { TarefasModule } from './tarefas/tarefas.module';
import { TipoDocumentoModule } from './tipo-documento/tipo-documento.module';
import { InteressesModule } from './interesses/interesses.module';
import { PrismaModule } from './prisma/prisma.module';
import { SiteConfigModule } from './site-config/site-config.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    StorageModule,
    EvolutionModule,
    AuthModule,
    HealthModule,
    ContatosModule,
    EmpreendimentosModule,
    ImoveisModule,
    ProprietariosModule,
    ProcessoDocumentoModule,
    TarefasModule,
    TipoDocumentoModule,
    InteressesModule,
    SiteConfigModule,
    AdminModule,
    PublicModule,
    DashboardModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
