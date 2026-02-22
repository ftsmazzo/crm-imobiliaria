# Variáveis de ambiente – EasyPanel

Use esta lista para configurar as **Variáveis de Ambiente** de cada serviço no EasyPanel. Não é necessário subir arquivo `.env` no GitHub; defina tudo no painel do EasyPanel.

---

## Serviço: Backend (API)

| Variável        | Obrigatória | Descrição | Exemplo (não usar em produção) |
|-----------------|-------------|-----------|----------------------------------|
| `DATABASE_URL`  | Sim         | URL de conexão PostgreSQL (inclui usuário, senha, host, porta e nome do banco). | `postgresql://usuario:senha@host:5432/crm_imobiliaria` |
| `JWT_SECRET`    | Sim         | Chave secreta para assinatura dos tokens JWT. Use string longa e aleatória em produção. | (gerar com `openssl rand -base64 32`) |
| `JWT_EXPIRES_IN`| Não         | Validade do token. Default: `7d`. | `7d` |
| `PORT`          | Não         | Porta em que a API sobe. EasyPanel costuma injetar porta; use default `3000` se não definir. | `3000` |
| `CORS_ORIGINS`  | Sim*        | Origens permitidas para CORS, separadas por vírgula (URLs do painel e do site). | `https://painel.seudominio.com.br,https://seudominio.com.br` |

\* Em produção defina com as URLs reais do painel CRM e do site de imóveis.

---

## Serviço: Painel CRM (crm-web)

Variáveis usadas no **build** (Vite injeta no bundle). Defina no EasyPanel antes do build.

| Variável        | Obrigatória | Descrição | Exemplo |
|-----------------|-------------|-----------|---------|
| `VITE_API_URL`  | Sim         | URL pública da API (backend). | `https://api.seudominio.com.br` |

---

## Serviço: Site de imóveis (site-imoveis)

Variáveis usadas no **build** (Next.js). Prefixo `NEXT_PUBLIC_` para ficarem disponíveis no cliente.

| Variável                  | Obrigatória | Descrição | Exemplo |
|---------------------------|-------------|-----------|---------|
| `NEXT_PUBLIC_API_URL`     | Sim         | URL pública da API (backend), para listagem de imóveis e envio de leads. | `https://api.seudominio.com.br` |

---

## Resumo rápido (copiar e colar no EasyPanel)

**Backend:**
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://painel.seudominio.com.br,https://seudominio.com.br
```

**Painel CRM (crm-web):**
```
VITE_API_URL=https://api.seudominio.com.br
```

**Site de imóveis:**
```
NEXT_PUBLIC_API_URL=https://api.seudominio.com.br
```

---

## Observações

- **PostgreSQL:** Pode ser um banco gerenciado (Supabase, Neon, etc.) ou um container no próprio EasyPanel; use o connection string que eles fornecerem em `DATABASE_URL`.
- **CORS:** Inclua exatamente as URLs dos seus front-ends (com `https://` e sem barra no final), separadas por vírgula, sem espaços.
- Os commits e o deploy serão feitos via repositório **crm-imobiliaria** no GitHub; o EasyPanel deve estar conectado a esse repo e usar o Dockerfile de cada serviço.
