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
| `NEXT_PUBLIC_WHATSAPP`    | Não         | Número para botão WhatsApp (apenas dígitos, com DDI). | `5511999999999` |
| `NEXT_PUBLIC_ENDERECO`    | Não         | Endereço exibido no rodapé. | `Av. Exemplo, 1000 - Centro` |
| `NEXT_PUBLIC_CRECI`       | Não         | CRECI para exibição no rodapé. | `12345-F` |

---

## Variáveis prontas (copiar e colar no EasyPanel)

### Backend
```
DATABASE_URL=postgresql://devocional:c7c136dbc2db1177bacc@imobmiq_postgres:5432/crm?sslmode=disable
JWT_SECRET=2aa77285629d3c786cd4962e9ae220d4
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://cmr-imobiliaria-crm-web.90qhxz.easypanel.host,https://cmr-imobiliaria-site-imoveis.90qhxz.easypanel.host
```

### Painel CRM (crm-web)
```
VITE_API_URL=https://cmr-imobiliaria-backend.90qhxz.easypanel.host
```

### Site de imóveis
```
NEXT_PUBLIC_API_URL=https://cmr-imobiliaria-backend.90qhxz.easypanel.host
```

---

## Como criar os serviços no EasyPanel

Um aplicativo (repo **crm-imobiliaria**), **3 serviços** — você cria cada serviço e define o **contexto** (pasta) onde está o Dockerfile:

| Serviço      | Pasta / Build context | Dockerfile           |
|--------------|------------------------|----------------------|
| Backend      | `backend`              | `backend/Dockerfile` |
| Painel CRM   | `crm-web`              | `crm-web/Dockerfile` |
| Site imóveis | `site-imoveis`         | `site-imoveis/Dockerfile` |

O EasyPanel não cria os 3 sozinhos: crie cada serviço, apontando o mesmo repositório e a pasta correspondente.

---

## Observações

- **PostgreSQL:** Pode ser um banco gerenciado (Supabase, Neon, etc.) ou um container no próprio EasyPanel; use o connection string que eles fornecerem em `DATABASE_URL`.
- **CORS:** Inclua exatamente as URLs dos seus front-ends (com `https://` e sem barra no final), separadas por vírgula, sem espaços.
- Os commits e o deploy serão feitos via repositório **crm-imobiliaria** no GitHub; o EasyPanel deve estar conectado a esse repo e usar o Dockerfile de cada serviço.
