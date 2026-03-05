# Implantação (sem acesso a shell)

O projeto está preparado para que **tudo rode na implantação** sem precisar executar comandos manualmente no terminal.

---

## Backend (NestJS + Prisma)

- **Build:** ao rodar `npm run build`, o script já executa `prisma generate` e depois `nest build`. O Prisma Client é gerado automaticamente.
- **Pós-instalação:** ao rodar `npm install`, o script `postinstall` executa `prisma generate`. Após instalar dependências, o client já está pronto.
- **Produção:** ao iniciar com `npm run start:prod`, o script executa `prisma migrate deploy` e em seguida sobe a aplicação. As migrações do banco rodam sozinhas na subida do serviço.

**Na implantação (ex.: serviço em nuvem, Docker, CI/CD):**

1. **Instalar:** `npm install` (ou `npm ci`)
2. **Buildar:** `npm run build`
3. **Iniciar:** `npm run start:prod`

Variáveis de ambiente necessárias: `DATABASE_URL` e, se usar arquivos/fotos/documentos, as do MinIO (`MINIO_SERVER_URL`, `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`, `MINIO_BUCKET`).

---

## Frontend (React/Vite)

- **Build:** `npm run build` gera a pasta `dist/` para servir estático.
- **Implantação:** configurar o serviço para usar o build (ex.: `dist`) e a URL da API via `VITE_API_URL` no build.

Nenhum comando extra no shell é necessário para o front.

---

## Resumo

| Ação        | O que acontece automaticamente                          |
|------------|----------------------------------------------------------|
| `npm install` (backend) | `prisma generate` roda no `postinstall`                |
| `npm run build` (backend) | `prisma generate` + `nest build`                       |
| `npm run start:prod` (backend) | `prisma migrate deploy` + sobe a aplicação            |

Assim, basta configurar **install → build → start** no seu ambiente de implantação; não é preciso acessar shell para rodar migrações ou gerar o Prisma Client.
