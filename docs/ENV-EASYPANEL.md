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
| `MINIO_SERVER_URL`  | Sim**   | URL do MinIO (API), com `https://` ou `http://`, sem barra no final. | `https://cmr-imobiliaria-minio.90qhxz.easypanel.host` |
| `MINIO_ROOT_USER`   | Sim**   | Usuário do MinIO (ex.: o que você definiu no Console). | `admin` |
| `MINIO_ROOT_PASSWORD` | Sim** | Senha do MinIO. | (a senha que você definiu) |
| `MINIO_BUCKET`  | Não         | Nome do bucket onde as fotos são salvas. Default: `crm`. | `crm` |

\* Em produção defina com as URLs reais do painel CRM e do site de imóveis.  
\** Necessário para upload de fotos de imóveis. Sem isso, o restante da API funciona, mas fotos não.

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
MINIO_SERVER_URL=https://cmr-imobiliaria-minio.90qhxz.easypanel.host
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=Fs142779@1524
MINIO_BUCKET=crm
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

## Migration do banco (Backend)

Após o primeiro deploy (ou após puxar alterações que tenham novas migrations), rode as migrations no container do backend. No EasyPanel você pode usar **Shell** no serviço do backend e executar:

```bash
npx prisma migrate deploy
```

Isso cria/atualiza as tabelas (incluindo a de fotos de imóveis). Se não rodar, a API pode falhar ao acessar tabelas que ainda não existem.

### Se der erro P3009 (migration falhou)

Quando uma migration é interrompida (container reiniciou, timeout, etc.), o Prisma marca ela como falha e para de aplicar. No **Shell do backend** no EasyPanel, rode **na ordem**:

**1. Marcar a migration que falhou como “revertida” (para poder aplicar de novo):**
```bash
npx prisma migrate resolve --rolled-back "20260222200000_add_imovel_foto"
```

**2. Aplicar as migrations de novo:**
```bash
npx prisma migrate deploy
```

Se no passo 2 aparecer erro tipo **“relation imovel_foto already exists”**, é porque a tabela já foi criada e só o registro da migration que ficou errado. Nesse caso, em vez de rodar o passo 1 e 2, rode só:

```bash
npx prisma migrate resolve --applied "20260222200000_add_imovel_foto"
```

Depois disso o container pode subir de novo (ou rode `migrate deploy` para conferir que está tudo aplicado).

---

## Observações

- **PostgreSQL:** Pode ser um banco gerenciado (Supabase, Neon, etc.) ou um container no próprio EasyPanel; use o connection string que eles fornecerem em `DATABASE_URL`.
- **CORS:** Inclua exatamente as URLs dos seus front-ends (com `https://` e sem barra no final), separadas por vírgula, sem espaços.
- **MinIO:** Use a URL da **API** do MinIO (não a do Console). Ex.: `https://cmr-imobiliaria-minio.90qhxz.easypanel.host` (sem `/console`). O bucket `crm` é criado automaticamente pelo backend se não existir.
- Os commits e o deploy serão feitos via repositório **crm-imobiliaria** no GitHub; o EasyPanel deve estar conectado a esse repo e usar o Dockerfile de cada serviço.
