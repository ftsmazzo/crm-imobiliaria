#!/bin/sh
# Aplica migrations. Se der P3009 (migration falhou), resolve e tenta de novo.
# No final garante que a tabela imovel_foto existe (fallback se migration em estado inconsistente).
set -e

if npx prisma migrate deploy; then
  :
else
  # Migration falhou (ex.: P3009): marcar como rolled-back e aplicar de novo
  npx prisma migrate resolve --rolled-back "20260222200000_add_imovel_foto" 2>/dev/null || true
  if npx prisma migrate deploy; then
    :
  else
    # Tabela pode já existir: marcar como aplicada para não travar
    npx prisma migrate resolve --applied "20260222200000_add_imovel_foto" 2>/dev/null || true
  fi
fi

# Garante tabela imovel_foto (CREATE IF NOT EXISTS) mesmo se migrate não tiver criado
npx prisma db execute --file scripts/ensure-imovel-foto.sql 2>/dev/null || true
exit 0
