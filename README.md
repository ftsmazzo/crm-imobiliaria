# CRM Imobiliário

Painel para corretores/gestores e site público de imóveis, compartilhando a mesma API. Deploy via **EasyPanel** (GitHub + Dockerfile). Variáveis de ambiente são configuradas no EasyPanel — ver [ENV-EASYPANEL.md](docs/ENV-EASYPANEL.md).

## Estrutura do projeto (monorepo)

```
├── backend/          # API (Node.js + NestJS + PostgreSQL)
├── crm-web/          # Painel CRM (React + Vite + TypeScript)
├── site-imoveis/     # Site público de imóveis (Next.js + TypeScript)
├── docs/             # Documentação do projeto
└── README.md
```

## Stack

| Parte        | Tecnologia                          |
|-------------|--------------------------------------|
| Backend     | Node.js, NestJS, TypeScript, PostgreSQL, Prisma, JWT |
| Painel CRM  | React, Vite, TypeScript              |
| Site imóveis| Next.js, TypeScript                 |

## Pré-requisitos

- **Node.js** 20+ e **npm** (ou pnpm/yarn)
- **PostgreSQL** 15+ (ou uso de banco em nuvem: Supabase, Neon, etc.)

## Como rodar localmente

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/SEU_USUARIO/crm-imobiliaria.git
cd crm-imobiliaria
cp .env.example .env
# Editar .env com as variáveis (só para desenvolvimento local; em produção use EasyPanel)
```

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate dev   # criar tabelas
npm run start:dev        # API em http://localhost:3000
```

### 3. Painel CRM

```bash
cd crm-web
npm install
npm run dev              # Painel em http://localhost:5173
```

### 4. Site de imóveis

```bash
cd site-imoveis
npm install
npm run dev              # Site em http://localhost:3001
```

(Configure no `.env` de cada front a URL da API, ex.: `VITE_API_URL=http://localhost:3000` e `NEXT_PUBLIC_API_URL=http://localhost:3000`.)

## Roadmap (MVP)

- **E0** – Fundação ✅
- **E1** – Backend base (modelos, auth, CRUD, rotas públicas)
- **E2** – CRM núcleo (painel: login, pipeline Kanban, contatos, imóveis, tarefas)
- **E3** – Uso real (permissões, entrada de leads, dashboard)
- **E4** – Site público (listagem, detalhe, formulários de lead)
- **E5** – Produção (deploy, domínio, SSL)

## Deploy (EasyPanel)

- Repositório: **crm-imobiliaria**. Commits e push são feitos pelo fluxo de desenvolvimento (assistente).
- Build e deploy: EasyPanel conectado ao GitHub, usando **Dockerfile** em cada serviço.
- **Não** versionar `.env`; todas as variáveis em produção vêm do EasyPanel. Ver [docs/ENV-EASYPANEL.md](docs/ENV-EASYPANEL.md).

## Documentação

- [Requisitos e roadmap detalhado](CRM-ImobMiq.md)
- [Variáveis de ambiente para EasyPanel](docs/ENV-EASYPANEL.md)
