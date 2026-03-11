# Estratégia de etapas – commit e deploy (EasyPanel)

Cada **etapa** = uma alteração fechada → **1 commit** → **1 push** no GitHub → você faz **implantação no EasyPanel**. Assim dá para validar cada parte antes da próxima.

---

## Visão geral

| Etapa | Título | O que entrega | Onde |
|-------|--------|----------------|------|
| 1 | Contatos interessados na ficha do imóvel | Exibir na tela de detalhe do imóvel a lista "Contatos interessados" (dado já vem da API). | Só front (crm-web) |
| 2 | Responsável no cadastro do imóvel | Campo "Responsável" (select de usuários) no formulário de imóvel, visível só para gestor. | Só front (crm-web) |
| 3 | Backend: criar vínculo de interesse | Endpoint para o painel criar Interesse (contato + imóvel). | Backend |
| 4 | Painel: vincular interesse | Botão "Vincular interesse" no contato e "Vincular contato" no imóvel, com modal para escolher imóvel/contato. | Front (crm-web) |
| 5 | Backend: CRUD de usuários | Criar, editar e desativar usuários (só gestor). | Backend |
| 6 | Painel: página Usuários | Página "Usuários" / "Equipe" no menu com lista e formulário novo/editar. | Front (crm-web) |

---

## Etapa 1 – Contatos interessados na ficha do imóvel

**Objetivo:** Na página de detalhe do imóvel, exibir a seção "Contatos interessados" com os leads que demonstraram interesse nesse imóvel (dado já retornado pela API).

**Alterações:**
- **crm-web/src/types.ts** – Adicionar no tipo `Imovel` o campo opcional `interesses?: Array<{ id: string; contato: { id: string; nome: string; email: string } }>` (ou tipo compatível com o que o backend retorna).
- **crm-web/src/pages/ImovelDetalhe.tsx** – Incluir um `<Block title="Contatos interessados">` que lista `imovel.interesses` com link para `/contatos` ou abre o detalhe do contato (ex.: modal). Se não houver interesses, exibir "Nenhum contato interessado" ou omitir o bloco.

**Deploy:** Só front (crm-web). Backend não muda.

**Commit sugerido:** `feat(crm-web): exibir contatos interessados na ficha do imóvel`

---

## Etapa 2 – Responsável no cadastro do imóvel

**Objetivo:** No formulário de imóvel (novo/editar), campo "Responsável" (select de usuários), **visível e editável apenas para gestor**.

**Alterações:**
- **crm-web/src/pages/ImovelCadastro.tsx** – Carregar lista de usuários (`getUsuarios()`) quando o usuário for gestor. Incluir no formulário um select "Responsável" (valor = `usuarioResponsavelId`), opção "Sem responsável". Ao salvar, enviar `usuarioResponsavelId` no payload de create/update. Só exibir o campo se `getUser()?.role === 'gestor'`.

**Deploy:** Só front. Backend já aceita `usuarioResponsavelId` no create/update do imóvel.

**Commit sugerido:** `feat(crm-web): campo responsável no cadastro do imóvel (só gestor)`

---

## Etapa 3 – Backend: criar vínculo de interesse

**Objetivo:** Permitir que o painel crie um registro de Interesse (contato + imóvel) via API.

**Alterações:**
- **backend** – Novo endpoint, por exemplo:
  - `POST /contatos/:contatoId/interesses` com body `{ imovelId: string }`, ou
  - `POST /interesses` com body `{ contatoId: string, imovelId: string }`.
- Regra: apenas usuário autenticado (e, se quiser, só gestor ou corretor responsável pelo contato/imóvel). Criar o registro com `tipo: 'interesse'`.
- Opcional: `DELETE /contatos/:contatoId/interesses/:interesseId` ou `DELETE /interesses/:id` para desvincular.

**Arquivos sugeridos:**
- Criar módulo `interesses` (controller + service) ou adicionar em `contatos.controller` os endpoints `POST /contatos/:id/interesses` e `GET` já vem no contato. O mais simples: controller `InteressesController` com `POST /interesses` (body: contatoId, imovelId), usando `PrismaService` para `interesse.create`. Registrar no `AppModule`.

**Deploy:** Backend. Rodar deploy do backend no EasyPanel após o push.

**Commit sugerido:** `feat(backend): endpoint para criar (e opcional excluir) interesse contato-imóvel`

---

## Etapa 4 – Painel: vincular interesse

**Objetivo:** No painel, poder vincular contato ↔ imóvel: a partir do contato escolher um imóvel, e a partir do imóvel escolher um contato.

**Alterações:**
- **crm-web/src/api.ts** – Função `createInteresse(contatoId: string, imovelId: string)` (e opcional `deleteInteresse(id: string)` se o backend tiver DELETE).
- **Contato / LeadDetailModal** – Botão "Vincular interesse" que abre um modal (ou navega para tela) para buscar/selecionar imóvel; ao confirmar, chama `createInteresse(contato.id, imovelId)` e atualiza a lista de interesses do contato (recarregar contato ou adicionar no estado).
- **ImovelDetalhe** – Na seção "Contatos interessados" (Etapa 1), botão "Vincular contato" que abre modal para buscar/selecionar contato; ao confirmar, chama `createInteresse(contatoId, imovel.id)` e recarrega o imóvel ou atualiza a lista.

**Deploy:** Só front (crm-web). Backend já estará na Etapa 3.

**Commit sugerido:** `feat(crm-web): vincular interesse contato-imóvel (modal no contato e no imóvel)`

---

## Etapa 5 – Backend: CRUD de usuários

**Objetivo:** Gestor poder criar, editar e desativar usuários (corretores) pela API.

**Alterações:**
- **backend/src/auth** – Novos endpoints (apenas para `role === 'gestor'`):
  - `POST /auth/usuarios` – body: nome, email, senha (e opcional role). Hash da senha e criar usuário.
  - `PATCH /auth/usuarios/:id` – body opcional: nome, email, senha (se enviada, re-hashar), ativo (boolean). Não permitir que gestor remova o próprio role ou desative a si mesmo (opcional).
  - Manter `GET /auth/usuarios` retornando lista (incluir ativo para o front poder esconder desativados ou marcar na lista).
- Validações: email único, senha com critério mínimo.

**Deploy:** Backend. Deploy no EasyPanel após o push.

**Commit sugerido:** `feat(backend): CRUD usuários (criar, editar, desativar) só para gestor`

---

## Etapa 6 – Painel: página Usuários

**Objetivo:** Menu com "Usuários" (ou "Equipe") e página com lista de usuários + botão "Novo" + edição (e opcional desativar).

**Alterações:**
- **crm-web/src/api.ts** – `createUsuario(dto)`, `updateUsuario(id, dto)` (e tipo para payload). Ajustar `getUsuarios()` se o backend passar a retornar mais campos (ex.: ativo, role).
- **crm-web** – Nova página `Usuarios.tsx`: lista em tabela (nome, email, role, ativo), botão "Novo usuário", botão "Editar" por linha. Modal ou página de formulário para criar/editar (nome, email, senha só no criar ou "alterar senha" no editar). Exibir link "Usuários" no menu (**só para gestor** – verificar `getUser()?.role === 'gestor'`).
- **crm-web/src/App.tsx** – Rota `/usuarios` para a nova página (protegida; só gestor pode acessar ou qualquer logado vê a rota mas o backend rejeita ações de não gestor).
- **crm-web/src/components/AppLayout.tsx** – Item de menu "Usuários" (ou "Equipe") apontando para `/usuarios`, visível apenas se gestor.

**Deploy:** Só front (crm-web).

**Commit sugerido:** `feat(crm-web): página Usuários/Equipe com CRUD (só gestor)`

---

## Ordem de execução e deploy

| Ordem | Etapa | Commit + push | O que implantar no EasyPanel |
|-------|--------|----------------|------------------------------|
| 1 | Contatos interessados na ficha do imóvel | 1º commit | Só **crm-web** (site do painel) |
| 2 | Responsável no cadastro do imóvel | 2º commit | Só **crm-web** |
| 3 | Backend: criar interesse | 3º commit | Só **backend** |
| 4 | Painel: vincular interesse | 4º commit | Só **crm-web** |
| 5 | Backend: CRUD usuários | 5º commit | Só **backend** |
| 6 | Painel: página Usuários | 6º commit | Só **crm-web** |

Após cada push, fazer o deploy do serviço indicado no EasyPanel e testar antes de seguir para a próxima etapa.

---

## Resumo

- **Etapas 1 e 2:** só front → commits 1 e 2 → deploy do **crm-web**.
- **Etapa 3:** backend → commit 3 → deploy do **backend**.
- **Etapa 4:** front → commit 4 → deploy do **crm-web**.
- **Etapa 5:** backend → commit 5 → deploy do **backend**.
- **Etapa 6:** front → commit 6 → deploy do **crm-web**.

Assim você entrega valor em cada passo e mantém o histórico do Git alinhado às implantações no EasyPanel.
