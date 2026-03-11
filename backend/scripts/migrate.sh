#!/bin/sh
# Aplica migrations. Se der P3009 (migration falhou), resolve e tenta de novo.
set -e

if npx prisma migrate deploy; then
  :
else
  # P3009: migration falhou. Marcar semáforo como rolled-back para reaplicar (tabela "Imovel" com I maiúsculo).
  npx prisma migrate resolve --rolled-back "20260309120000_imovel_semaforo_disponibilidade" 2>/dev/null || true
  if ! npx prisma migrate deploy; then
    # Fallback antigo se outra migration falhou
    npx prisma migrate resolve --rolled-back "20260222200000_add_imovel_foto" 2>/dev/null || true
    npx prisma migrate deploy || true
    npx prisma migrate resolve --applied "20260222200000_add_imovel_foto" 2>/dev/null || true
  fi
fi

# Garante tabela imovel_foto (CREATE IF NOT EXISTS) mesmo se migrate não tiver criado
npx prisma db execute --file scripts/ensure-imovel-foto.sql 2>/dev/null || true

# Garante tabela site_config para personalização do site
npx prisma db execute --file scripts/ensure-site-config.sql 2>/dev/null || true
exit 0
