# Redesign visual do CRM Imobiliário

> **Objetivo:** modernizar apenas a aparência do CRM.  
> **Não alterar:** rotas, APIs, lógica de negócio, estrutura de pastas ou nomes de entidades.

---

## Princípios

- **Só mudança visual:** cores, tipografia, espaçamentos, sombras, bordas, ícones e layout dos componentes.
- **Manter tudo que já existe:** `crm-web`, rotas (`/`, `/contatos`, `/pipeline`, `/tarefas`, `/imoveis`, etc.), estágios do pipeline (novo, lead, qualificado, visita, proposta, fechado), chamadas de API, hooks e estado.
- **Nenhuma alteração no backend** durante o redesign.
- **Um passo por vez:** validar (TypeScript, build) e commitar antes de passar ao próximo.

---

## Estrutura do repositório (inalterada)

```
/
├── backend/          # NestJS + Prisma + PostgreSQL — não modificar
├── crm-web/          # React + Vite + TypeScript — apenas estilos e estrutura de layout
├── site-imoveis/     # Site público — fora do escopo deste guia (opcional depois)
└── docs/
    └── REDESIGN-VISUAL.md   # Este arquivo
```

---

## Fluxo de trabalho

1. Fazer alterações visuais no `crm-web/`.
2. Antes de cada push:
   ```bash
   cd crm-web && npx tsc --noEmit && npm run build
   ```
3. Commit por etapa concluída, ex.: `feat(crm-web): design tokens and global styles`.

---

## Sistema de design — Tokens

Criar **`crm-web/src/styles/tokens.css`** e passar a usar essas variáveis em todo o CRM (substituindo gradualmente `theme.css` / `--crm-*`).

```css
/* crm-web/src/styles/tokens.css */
:root {
  /* Backgrounds */
  --bg-base:        #0F1117;
  --bg-surface:     #16191F;
  --bg-elevated:    #1E2330;
  --bg-overlay:     #252A38;

  /* Borders */
  --border-subtle:  #2A2F3D;
  --border-default: #333A4D;
  --border-strong:  #4A5166;

  /* Brand / Accent */
  --accent:         #2F80ED;
  --accent-hover:   #1A6FD4;
  --accent-muted:   rgba(47, 128, 237, 0.12);
  --accent-warm:    #F2994A;
  --success:        #27AE60;
  --danger:         #EB5757;
  --warning:        #F2C94C;

  /* Text */
  --text-primary:   #F0F2F7;
  --text-secondary: #8B92A5;
  --text-muted:     #4A5166;
  --text-inverse:   #0F1117;

  /* Spacing (grid 8px) */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Border radius */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm:     0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-md:     0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-lg:     0 8px 32px rgba(0, 0, 0, 0.6);
  --shadow-accent:  0 0 0 3px rgba(47, 128, 237, 0.25);

  /* Typography */
  --font-display: 'Plus Jakarta Sans', sans-serif;
  --font-body:    'DM Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;
}
```

### Fontes

No `crm-web/index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## Layout (Shell) — o que já existe

Hoje o CRM usa **`AppLayout`** com:

- Sidebar (aberta/fechada) com links: **Início**, **Pipeline**, **Contatos**, **Imóveis**, **Proprietários**, **Empreendimentos**, **Tarefas**
- Header com menu hamburger, nome do usuário e botão Sair
- Área principal (`main`) para o conteúdo das rotas

**Redesign do shell:** manter o mesmo componente e as mesmas rotas; apenas trocar classes CSS e usar os novos tokens (cores, espaçamentos, bordas, sombras). Opcional: reorganizar em arquivos como `AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx` **sem alterar rotas nem comportamento**.

### Dimensões sugeridas (apenas visual)

| Elemento   | Medida              |
|-----------|----------------------|
| Sidebar fechada | 64px largura  |
| Sidebar aberta  | 220px largura |
| Header (Topbar)  | 56px altura   |

### Estilo dos itens do menu

| Estado  | Estilo |
|--------|--------|
| Default | `color: var(--text-secondary)` |
| Hover   | `background: var(--bg-elevated)`, `color: var(--text-primary)` |
| Ativo   | `background: var(--accent-muted)`, `color: var(--accent)`, borda esquerda `3px solid var(--accent)` |

---

## Páginas — apenas visual

- **Rotas:** não criar nem renomear rotas. Continuar: `/`, `/contatos`, `/pipeline`, `/imoveis`, `/tarefas`, `/proprietarios`, `/empreendimentos`, etc.
- **Dados:** manter todos os hooks e chamadas de API atuais (getContatos, getTarefas, getImoveis, etc.).
- **Pipeline:** manter os estágios atuais: **Novo**, **Lead**, **Qualificado**, **Visita**, **Proposta**, **Fechado**. Apenas redesenhar cards e colunas (cores, bordas, badges, drag & drop já existente).
- **Contatos:** mesma tabela/lista e filtros; apenas novo estilo (tabela, badges de etapa, botões).
- **Imóveis:** mesma listagem (grid/tabela) e filtros; apenas novo estilo.
- **Tarefas:** mesma lista e formulários; apenas novo estilo.
- **Dashboard:** mesmos KPIs e dados; apenas novo layout e tokens.

Não adicionar colunas ou campos que não existam no backend (ex.: Score). Não adicionar itens de menu para páginas que não existem.

---

## Ordem de execução sugerida

Fazer **uma etapa por vez**. Depois de cada uma: `npx tsc --noEmit`, `npm run build`, commit.

1. **Etapa 1 — Tokens e base**
   - Criar `crm-web/src/styles/tokens.css`
   - Criar `crm-web/src/styles/animations.css` (transições, hover, skeleton se quiser)
   - Criar `crm-web/src/styles/global.css` (reset / defaults usando tokens)
   - Adicionar fontes no `index.html`
   - Importar tokens e global no `main.tsx` (ou ponto de entrada)
   - **Não** remover de uma vez o `theme.css`; pode coexistir e ir trocando classes aos poucos.

2. **Etapa 2 — Shell (Sidebar + Header)**
   - Aplicar tokens no `AppLayout` e no `AppLayout.css` (ou nos novos componentes de shell, se separar).
   - Mesmos links e mesma lógica (abrir/fechar sidebar, sair).
   - Validar: rota ativa destacada, auth intacto.

3. **Etapa 3 — Dashboard**
   - Aplicar tokens e novo estilo nos blocos do Dashboard.
   - Manter hooks e APIs; só mudar markup de layout e classes CSS.

4. **Etapa 4 — Contatos**
   - Redesenhar tabela/lista e filtros com tokens.
   - Manter dados, ordenação, filtros e ações atuais.

5. **Etapa 5 — Pipeline**
   - Redesenhar colunas e cards com tokens (e badges por estágio).
   - Manter estágios atuais e o drag & drop já existente.

6. **Etapa 6 — Imóveis**
   - Redesenhar grid/tabela e filtros com tokens.
   - Manter dados e comportamento.

7. **Etapa 7 — Tarefas**
   - Redesenhar lista e formulários com tokens.
   - Manter lógica e APIs.

8. **Etapa 8 — Demais páginas**
   - Login, Proprietários, Empreendimentos, cadastros e detalhes: aplicar tokens e estilo consistente.
   - Opcional: extrair componentes de UI (Button, Badge, Card) que usem só tokens, para padronizar.

---

## Regras

- **Não** alterar arquivos em `backend/` para este redesign.
- **Não** mudar rotas, nomes de rotas ou estrutura de URLs.
- **Não** mudar estágios do pipeline no backend; só labels/visual no front.
- **Não** fazer push com erros de TypeScript.
- **Sempre** usar variáveis CSS (tokens) para cores e espaçamentos nas partes redesenhadas.
- **Sempre** preservar auth (JWT), proteção de rotas e chamadas de API existentes.

---

## Resumo

| O que fazemos | O que não fazemos |
|---------------|-------------------|
| Novos tokens e estilos globais | Mudar backend ou APIs |
| Redesenhar Sidebar e Header | Adicionar/renomear rotas |
| Redesenhar páginas com tokens | Adicionar estágios ou campos novos no backend |
| Manter Pipeline com os 6 estágios atuais | Introduzir páginas (Relatórios, Automações, etc.) |
| Melhorar aparência de tabelas, cards, botões | Mudar lógica de negócio ou fluxos |

O intuito é deixar o CRM mais moderno e conceitual **sem mudar o projeto**: mesma estrutura, mesma forma como foi construído até agora, só visual renovado.
