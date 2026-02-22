# Próximos passos – CRM realmente funcional

O MVP (E0–E5) está pronto. Abaixo, sugestão de **próximos passos** por prioridade para o sistema ficar **realmente funcional** no dia a dia.

---

## Prioridade alta (maior impacto)

### 1. **Fotos nos imóveis**
**Situação hoje:** Cadastro de imóvel sem fotos; site e painel mostram placeholder cinza.  
**Objetivo:** Pelo menos 1–3 fotos por imóvel (upload ou URL).  
**O que fazer:**
- Backend: modelo `ImovelFoto` (imovelId, url, ordem) ou campo `fotos` (JSON array de URLs).
- Painel: no formulário de imóvel, campo para adicionar URLs de fotos ou upload (se tiver storage).
- Site: galeria na página do imóvel e thumbnail nos cards da listagem.
- **Alternativa simples:** começar só com **URL de imagem** (link externo) por imóvel; depois evoluir para upload.

### 2. **Interesses visíveis e acionáveis no painel**
**Situação hoje:** O site envia lead com `imovelId` e o backend cria `Interesse`. No painel não aparece “este contato tem interesse no imóvel X” nem “quem se interessou por este imóvel”.  
**Objetivo:** Ver e criar vínculos lead ↔ imóvel no CRM.  
**O que fazer:**
- **Ficha do contato:** listar “Imóveis de interesse” (interesses) com link para o imóvel; botão “Vincular interesse” (escolher imóvel).
- **Ficha do imóvel:** listar “Contatos interessados” com link para o contato.
- Backend: endpoints já existem (Interesse no Prisma). Garantir GET contato com interesses e GET imóvel com interesses (já incluem). Painel só precisa exibir e ter tela/modal para criar novo Interesse.

### 3. **Busca e filtros no painel**
**Objetivo:** Achar contato e imóvel rápido.  
**O que fazer:**
- **Contatos:** campo de busca por nome ou e-mail; filtro por responsável (gestor).
- **Imóveis:** filtro por faixa de preço (valor mínimo/máximo); ordenação por preço ou data; busca por código.
- **Pipeline:** filtro por responsável (gestor vê por corretor).

### 4. **Gestão de usuários (gestor)**
**Situação hoje:** Usuários só via seed.  
**Objetivo:** Gestor criar/editar corretores sem mexer em código.  
**O que fazer:**
- Backend: CRUD de usuários (só gestor); listar, criar, editar (nome, email, senha), desativar.
- Painel: página “Usuários” ou “Equipe” (menu só para gestor); lista + formulário novo/editar.

### 5. **Atribuir responsável ao contato/imóvel**
**Situação hoje:** Corretor assume o que cria; gestor não consegue atribuir outro responsável pela interface.  
**Objetivo:** Gestor atribuir contato/imóvel a um corretor.  
**O que fazer:**
- Painel: no formulário de contato e de imóvel, campo “Responsável” (select de usuários) **visível e editável só para gestor**. Backend já aceita `usuarioResponsavelId`.

### 6. **Nova tarefa a partir do contato ou do imóvel**
**Situação hoje:** Tarefa pode ser vinculada a contato/imóvel, mas a criação é genérica.  
**Objetivo:** Na ficha do contato ou do imóvel, botão “Nova tarefa” já com vínculo preenchido.  
**O que fazer:**
- Na tela de detalhe do contato (ou no modal), botão “Nova tarefa” que abre o modal de tarefa com `contatoId` (ou `imovelId`) já preenchido.

---

## Prioridade média

### 7. **Dashboard mais útil**
- Lista clicável de “Tarefas atrasadas” (já tem o número; virar link/lista).
- Gráfico simples (barras) por estágio do funil.
- Card “Novos leads” já existe; manter e talvez destacar mais.

### 8. **Site: filtros e fotos**
- Filtro por faixa de preço (venda/aluguel) na listagem.
- Quando houver fotos: galeria no detalhe do imóvel e thumbnail nos cards.

### 9. **Detalhe do contato no painel**
- Página ou drawer “Detalhe do contato” com: dados, estágio, responsável, imóveis de interesse, tarefas vinculadas e “Nova tarefa”. Hoje o pipeline abre algo? Verificar e consolidar.

---

## Prioridade depois

- Relatórios (conversão por estágio, por período).
- Envio de e-mail/SMS (lembretes, confirmação de visita).
- Múltiplas fotos com upload para storage (S3 ou similar).
- Personalização/white-label (nome e logo da imobiliária no painel e no site).

---

## Ordem sugerida para implementar

| # | Passo                         | Entrega principal                          |
|---|-------------------------------|--------------------------------------------|
| 1 | Fotos nos imóveis (URL ou 1 campo) | Site e painel com imagem real              |
| 2 | Interesses no painel          | Ver e vincular lead ↔ imóvel               |
| 3 | Busca/filtros (contatos, imóveis) | Achar registro rápido                      |
| 4 | Gestão de usuários            | Criar/editar corretores pelo painel         |
| 5 | Atribuir responsável (gestor) | Select de responsável em contato/imóvel    |
| 6 | Nova tarefa do contato/imóvel | Criar tarefa já vinculada                  |

Recomendação: começar por **1 (fotos)** e **2 (interesses no painel)**; são os que mais deixam o produto “real” e utilizável no dia a dia.
