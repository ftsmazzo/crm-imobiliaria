# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

CRM Imobiliário (Real Estate CRM) — monorepo with 3 services. See `README.md` for full details.

| Service | Dir | Port | Dev command |
|---|---|---|---|
| Backend API (NestJS) | `backend/` | 3000 | `npm run start:dev` |
| CRM Panel (React+Vite) | `crm-web/` | 5173 | `npm run dev` |
| Public Site (Next.js) | `site-imoveis/` | 3001 | `npm run dev` |

### Important caveats

- **PostgreSQL required**: Must be running on port 5432 before starting the backend. Start with `sudo pg_ctlcluster 16 main start`.
- **No dotenv in backend**: NestJS does NOT auto-load `.env` files (no `@nestjs/config` or `dotenv`). You must either `export` the env vars or use `env $(cat backend/.env | xargs)` when running the backend. However, `nest start --watch` does seem to pick up Prisma's DATABASE_URL from `backend/.env` via Prisma's built-in dotenv loading.
- **Migration bug**: The third migration (`20260222200000_add_imovel_foto`) has a table name case mismatch (references `"imovel"` instead of `"Imovel"`). Use `npx prisma db push` instead of `npx prisma migrate dev` to sync the schema.
- **Seed data**: Run `node prisma/seed.js` in `backend/` after schema sync. Default login: `fredmazzo@gmail.com` / `Alterar@123`.
- **Auth DTO**: Login endpoint uses field `senha` (not `password`): `POST /auth/login { "email": "...", "senha": "..." }`.
- **ESLint not configured**: No eslint config files exist. TypeScript type-checking (`tsc --noEmit` / `tsc -b`) is the practical lint alternative.
- **MinIO optional**: Photo upload features require MinIO but the rest of the application works without it.
- **Environment files**: Each service needs its own `.env` — `backend/.env` (DATABASE_URL, JWT_SECRET, etc.), `crm-web/.env` (VITE_API_URL), `site-imoveis/.env.local` (NEXT_PUBLIC_API_URL). See `.env.example` at repo root.
