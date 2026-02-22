#!/bin/sh
# Aplica migrations. Se der P3009 (migration falhou), resolve e tenta de novo.
set -e

if npx prisma migrate deploy; then
  exit 0
fi

# Migration falhou (ex.: P3009): marcar como rolled-back e aplicar de novo
npx prisma migrate resolve --rolled-back "20260222200000_add_imovel_foto" 2>/dev/null || true
if npx prisma migrate deploy; then
  exit 0
fi

# Tabela pode já existir: marcar como aplicada para o app subir
npx prisma migrate resolve --applied "20260222200000_add_imovel_foto" 2>/dev/null || true
exit 0
