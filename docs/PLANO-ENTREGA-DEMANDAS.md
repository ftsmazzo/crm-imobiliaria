# Estratégia e plano de entrega – demandas do cliente

> Priorização com base em: MVP, estrutura atual, baixo risco, alto impacto.  
> Entregar em fases para validar uso antes de adicionar complexidade.

---

## Princípios

1. **Fase 1** = arroz e feijão: corrige confusões, entrega o que já “fecha” conceitos (ex.: detalhe do lead, estágios, exportação).
2. **Fase 2** = refinamento: filtros, permissões, pequenos campos (valor disponível, prioridade).
3. **Fase 3** = depois de uso real: automações, follow-up, anexos, mapa, BI avançado.

---

## Fase 1 – Fundação (prioritário)

Objetivo: cliente usar o CRM sem confusão de conceitos e com as entregas mais pedidas.

| # | Entrega | O que fazer | Observação |
|---|---------|--------------|------------|
| 1.1 | **Detalhe do lead (pop-up/modal)** | Tela ou painel ao clicar no lead (Pipeline e Contatos): dados do contato, responsável, observações. Botão "Nova tarefa" levando ao fluxo já existente com contato preenchido. | Centraliza o que hoje está espalhado; evita misturar “estágio” com “tarefa”. |
| 1.2 | **Novos estágios no Pipeline** | Incluir no backend e no front: **Contato inicial**, **Perdido**, **Perdido com remarketing**. Manter ordem das colunas (ex.: Contato inicial após Lead). | `estagio` já é string; só novos valores + labels. |
| 1.3 | **Pipeline: filtro por corretor** | Filtro “Responsável” na tela do Pipeline usando `usuarioResponsavelId` do contato. | Dado já existe. |
| 1.4 | **Contatos: filtro por estágio** | Garantir filtro por estágio na listagem de Contatos (se ainda não houver, adicionar). | Rápido. |
| 1.5 | **Exportar contatos (planilha)** | Botão “Exportar” em Contatos: CSV/Excel com campos do contato (nome, email, telefone, origem, estágio, responsável, observações, etc.). | Atende remarketing e análise sem mudar modelo. |
| 1.6 | **Permissões: Corretor x Administrativo** | Tratar como **usuários** (não “proprietários”): Corretor = acesso a tudo, não edita lead de outro, pode “passar” lead para outro corretor. Administrativo/Gestor = controle total como hoje. | Ajuste de regra de negócio em auth/permissões; não mexe em Proprietários (dono do imóvel). |

**Resultado Fase 1:** Pipeline e Contatos alinhados ao conceito (estágio vs tarefa), lead com “cara” de cadastro único (detalhe), exportação e filtros básicos, e papéis de usuário claros.

---

## Fase 2 – Refinamento

Objetivo: campos e filtros que apoiam o dia a dia sem automação pesada.

| # | Entrega | O que fazer | Observação |
|---|---------|-------------|------------|
| 2.1 | **Campo “Valor disponível” no lead** | Campo opcional no contato (ex.: valor máximo para imóvel). Mostrar e editar no detalhe do lead. Incluir na exportação. | Um campo; sem automação. |
| 2.2 | **Tarefas: prioridade** | Campo prioridade (ex.: baixa, média, alta) em tarefa. Exibir na lista e no formulário. | Opcional no cadastro; usuário define. |
| 2.3 | **Imóveis: código automático** | Ao criar imóvel, backend gera código de referência se não for informado (ex.: sequencial ou prefixo + número). | Regra só no create. |
| 2.4 | **Imóveis: “Promoção”** | Campo booleano ou tag “Promoção” no imóvel. Opção na edição. Site pode usar junto com “destaque” se quiser. | Um campo. |
| 2.5 | **Imóveis: filtros no CRM** | Filtros na listagem do CRM: corretor responsável, faixa de valor (min–max), quartos, m² (min), busca por texto (condomínio/nome). | Query em cima dos campos atuais. |
| 2.6 | **Imóveis: destaque só para gestor** | Apenas usuário gestor pode marcar/desmarcar “destaque” no imóvel. Corretor não vê ou não pode alterar. | Checagem de role no front e no backend. |
| 2.7 | **Dashboard: números com período** | No Início: cards ou números para “Leads no período” e “Imóveis cadastrados no período” com filtro de data (mês/intervalo). “Valor vendido” só se houver fonte de dado definida (senão deixar para Fase 3). | Endpoint ou cálculo a partir de contatos e imóveis. |
| 2.8 | **Empreendimentos: busca por nome** | Campo de busca na listagem de Empreendimentos filtrando por nome. | Simples. |

**Resultado Fase 2:** Leads e imóveis mais utilizáveis no dia a dia, tarefas com prioridade, e Dashboard com noção de período.

---

## Fase 3 – Depois de validar uso

Objetivo: só após o cliente usar Fase 1 e 2; evita travar MVP em regras complexas.

| # | Entrega | O que fazer | Observação |
|---|---------|-------------|------------|
| 3.1 | **Follow-up automático** | Regra tipo: “X dias sem contato → criar tarefa para corretor”. Exige campo “último contato” ou derivação, e job/rotina. | Definir regra com cliente após ver uso real. |
| 3.2 | **Contagem de tempo no lead** | Exibir “dias no estágio” ou “dias desde primeiro contato” no card/pop-up. Pode alimentar relatórios depois. | Campos de data + cálculo. |
| 3.3 | **Anexos no lead** | Upload de arquivos vinculados ao contato (ou à tarefa), com armazenamento (ex.: mesmo padrão de fotos do imóvel). | Novo recurso de storage e UI. |
| 3.4 | **Tarefas automáticas (ex.: primeiro contato)** | Ao lead entrar em certo estágio ou após cadastro, criar tarefa “Responder primeiro contato” automaticamente. | Regra de negócio + possível job. |
| 3.5 | **Valor vendido no Dashboard** | Gráfico ou número de “valor vendido” com filtro de mês. Só viável se existir registro de vendas (ex.: estágio “Fechado” + valor do imóvel, ou tabela de negócios). | Definir com cliente a fonte dos dados. |
| 3.6 | **Cadastro de imóvel em uma aba** | Reorganizar edição do imóvel em uma única tela com seções e “Salvar alterações”. | UX; pode quebrar fluxo atual se não for planejado. |
| 3.7 | **Proprietário obrigatório no imóvel** | Validação: não permitir salvar imóvel sem proprietário vinculado. | Regra de validação. |
| 3.8 | **Docs do imóvel (IPTU, autorização)** | Nova área de anexos do imóvel (documentos), separada de fotos. | Storage + UI. |
| 3.9 | **Empreendimento: características e fotos** | Campos ou lista de características (ex.: pet-friendly, segurança 24h). Galeria de fotos do empreendimento. | Modelo + upload. |
| 3.10 | **Mapa no cadastro do imóvel** | Endereço com marcador no mapa (ex.: Google Maps) e, se vincular a empreendimento, opção de pular endereço manual. | Integração e UX. |

---

## Ordem sugerida de execução (passos)

### Fase 1
1. Implementar **detalhe do lead** (modal/página) com dados, responsável, observações e acesso a “Nova tarefa”.
2. Adicionar estágios **Contato inicial**, **Perdido**, **Perdido com remarketing** (backend + front).
3. Colocar **filtro por corretor** no Pipeline.
4. Garantir **filtro por estágio** em Contatos e implementar **exportação** (CSV/Excel).
5. Ajustar **permissões** (Corretor vs Administrativo) e regra de “passar lead” entre corretores.

### Fase 2
6. Campo **valor disponível** no contato + exibição no detalhe do lead e na exportação.
7. **Prioridade** em tarefas.
8. **Código automático** do imóvel no create.
9. Campo **Promoção** no imóvel e **destaque só gestor**.
10. **Filtros** na listagem de imóveis no CRM.
11. **Dashboard**: leads e imóveis no período com filtro de data.
12. **Busca por nome** em Empreendimentos.

### Fase 3
13. Conforme uso e combinado com o cliente: follow-up automático, contagem de tempo, anexos, tarefas automáticas, valor vendido, cadastro em uma aba, proprietário obrigatório, docs do imóvel, características/fotos do empreendimento, mapa.

---

## Resumo

| Fase | Foco | Entregas principais |
|------|------|----------------------|
| **1** | Fundação e clareza | Detalhe do lead, novos estágios, filtros (corretor/estágio), exportação, permissões Corretor/Admin |
| **2** | Refinamento | Valor disponível, prioridade em tarefas, código imóvel, promoção, filtros imóveis, Dashboard com período, busca empreendimentos |
| **3** | Após uso | Automações, anexos, tempo no funil, valor vendido, mapa, docs imóvel, empreendimento (características/fotos) |

Usar este plano como guia para desenvolvimento e para alinhar expectativas com o cliente (“primeiro Fase 1, depois refinamos”).
