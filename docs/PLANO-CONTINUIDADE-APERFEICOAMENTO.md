# Plano de continuidade e aperfeiçoamento – CRM Imobiliário

Visão: CRM **com intervenção, interação e apoio por IA**, integrado a **WhatsApp (Evolution API)** e **n8n**, com **upload real de imagens** e **automação de postagem no Instagram**.

---

## Visão geral

| Pilar | Objetivo |
|-------|----------|
| **Base sólida** | Upload de fotos, interesses no painel, busca, gestão de usuários – para o CRM ser o “single source of truth”. |
| **Mídia e canais** | Fotos por upload (não link); mesmo acervo servindo site, WhatsApp e Instagram. |
| **Integração n8n + Evolution API** | WhatsApp e agentes conectados ao CRM; fluxos de automação (lead recebido, lembrete, follow-up). |
| **Automação Instagram** | Postagem automática de imóveis (fotos + dados) a partir do CRM, via n8n ou API. |
| **IA** | Intervenção (sugestões, alertas), interação (chat/assistente) e apoio (respostas automáticas, qualificação de lead). |

---

## Fases e prioridades (redefinidas)

### Fase 1 – Base e mídia (fundação para integrações e IA)

Objetivo: dados e imagens no lugar certo para n8n, Instagram e IA consumirem.

| # | Item | Descrição | Por que antes das integrações |
|---|------|-----------|-------------------------------|
| 1.1 | **Upload de imagens (imóveis)** | Armazenar fotos no servidor ou em storage (S3/Spaces). Modelo `ImovelFoto` (imovelId, arquivo/path, ordem). API: upload multipart; GET da URL pública. | Instagram e site precisam de imagem real; Evolution/WhatsApp podem enviar foto do imóvel; IA pode analisar imagem. |
| 1.2 | **Interesses no painel** | Ficha do contato: “Imóveis de interesse” + vincular. Ficha do imóvel: “Contatos interessados”. | n8n e IA podem reagir a “novo interesse”; relatórios e automação dependem desse vínculo. |
| 1.3 | **Busca e filtros (painel)** | Contatos: busca por nome/e-mail; Imóveis: faixa de preço, ordenação; Pipeline: filtro por responsável. | Gestão do dia a dia; fluxos de IA/automação usam listas filtradas. |
| 1.4 | **Gestão de usuários + atribuir responsável** | CRUD usuários (gestor); campo “Responsável” em contato/imóvel (gestor). | Atribuição automática de lead (roleta) e relatórios por corretor. |
| 1.5 | **Nova tarefa a partir do contato/imóvel** | Botão “Nova tarefa” na ficha do contato/imóvel com vínculo preenchido. | Automação pode criar tarefas; usuário precisa do mesmo fluxo. |

Entregas Fase 1:  
- Imóvel com múltiplas fotos (upload); site e painel exibindo galeria.  
- Contato e imóvel com interesses visíveis e acionáveis.  
- Busca/filtros e gestão de equipe no painel.

---

### Fase 2 – Integração n8n + Evolution API (WhatsApp e agentes)

Objetivo: CRM como centro; WhatsApp e agentes como canais que leem e escrevem no CRM.

| # | Item | Descrição |
|---|------|-----------|
| 2.1 | **API e webhooks para n8n** | Endpoints ou webhooks que o n8n consiga chamar: “novo lead”, “novo interesse”, “contato atualizado”. Opção: backend emite evento (webhook URL configurável) ao criar lead/interesse. |
| 2.2 | **Endpoints para Evolution API** | Se a “estrutura digital” já expõe Evolution API: n8n orquestra “enviar mensagem WhatsApp” usando dados do CRM (contato.telefone, texto com link do imóvel, ou imagem do imóvel). Definir em config: URL da Evolution, instância, token. |
| 2.3 | **Fluxos n8n sugeridos** | (a) Novo lead no CRM → enviar WhatsApp de boas-vindas. (b) Novo interesse (contato + imóvel) → enviar foto do imóvel + texto pelo WhatsApp. (c) Tarefa “Ligar para X” vencendo → lembrete WhatsApp ou notificação no painel. |
| 2.4 | **Agentes e IA no fluxo** | n8n + Evolution: agente que responde no WhatsApp. CRM envia contexto (últimos leads, imóveis visitados) para o agente; agente pode criar/atualizar contato ou interesse via API do CRM. |

Entregas Fase 2:  
- CRM dispara webhook/evento para n8n em eventos chave.  
- n8n conectado à Evolution API; fluxos de mensagem e (opcional) agente com contexto do CRM.

---

### Fase 3 – Automação de postagem no Instagram

Objetivo: postar no Instagram a partir dos imóveis do CRM (fotos já em upload).

| # | Item | Descrição |
|---|------|-----------|
| 3.1 | **Fonte de dados** | API do CRM: listar imóveis “disponíveis” com fotos (URL pública). n8n ou serviço intermediário consome essa API. |
| 3.2 | **Canal de postagem** | Opções: (a) n8n + integração Instagram (Graph API / ferramenta que poste); (b) serviço dedicado (ex.: Buffer, Later) com API; (c) script agendado que chama API do Instagram. Escolher uma e documentar. |
| 3.3 | **Regras de postagem** | Ex.: imóvel “disponível” + tem foto + não foi postado nos últimos X dias. Campo opcional no imóvel: `ultimaPostagemInstagram` ou “já postado” para controle. |
| 3.4 | **Conteúdo do post** | Texto: título, valor, bairro, link para o site do imóvel. Imagem: primeira foto do imóvel (ou galeria). Tudo vindo do CRM. |

Entregas Fase 3:  
- Fluxo (n8n ou outro) que, em horário agendado, busca imóveis elegíveis, monta post e publica no Instagram usando as imagens em upload do CRM.

---

### Fase 4 – IA: intervenção, interação e apoio

Objetivo: IA ajudando no dia a dia (sugestões, respostas, qualificação) sem substituir o corretor.

| # | Item | Descrição |
|---|------|-----------|
| 4.1 | **Intervenção (sugestões e alertas)** | Ex.: “Contato X parado em ‘Qualificado’ há 7 dias”; “Imóvel Y sem foto”; “3 leads novos sem atribuição”. Fonte: dados do CRM; pode ser regras fixas ou modelo (ex.: “probabilidade de conversão”). Exibir no dashboard ou em widget. |
| 4.2 | **Interação (chat/assistente no painel)** | Assistente no painel: “Quais imóveis em Centro para alugar?”; “Resumo do contato João”. Backend: endpoint que recebe pergunta e contexto (usuário, filtros) e chama LLM; resposta com dados reais do CRM (RAG ou chamadas à API). |
| 4.3 | **Apoio no WhatsApp (agentes)** | Agente via Evolution API + n8n: responde dúvidas, sugere imóveis, qualifica lead. Usa API do CRM para buscar imóveis e criar/atualizar contato/interesse. IA como “apoio” ao corretor, não substituição. |
| 4.4 | **Automação inteligente** | n8n + IA: classificar lead (comprar/alugar, faixa de preço); sugerir imóveis para enviar ao contato; redigir mensagem personalizada. CRM continua como fonte de verdade; IA sugere ações. |

Entregas Fase 4:  
- Dashboard ou painel com blocos de “sugestões/alertas” da IA.  
- Assistente (chat) no painel respondendo perguntas sobre contatos e imóveis.  
- Fluxos de agente no WhatsApp usando CRM + IA (qualificação, sugestão de imóveis).

---

## Resumo da ordem de execução

| Fase | Foco | Principais entregas |
|------|------|----------------------|
| **1** | Base e mídia | Upload de fotos, interesses no painel, busca/filtros, gestão de usuários, tarefa a partir de contato/imóvel |
| **2** | n8n + Evolution API | Webhooks/API para n8n, fluxos WhatsApp (boas-vindas, envio de imóvel), agentes com contexto do CRM |
| **3** | Instagram | Postagem automática de imóveis (fotos + dados do CRM) via n8n ou serviço integrado |
| **4** | IA | Sugestões/alertas, assistente no painel, agente WhatsApp com IA, automação inteligente (qualificação, sugestão de imóveis) |

---

## Dependências entre fases

- **Fase 2 e 3** dependem de **Fase 1**: upload de imagens e dados bem estruturados (interesses, responsáveis).  
- **Fase 3** depende de **Fase 1.1** (upload): postagem no Instagram usa as mesmas fotos.  
- **Fase 4** usa os mesmos eventos e APIs das Fases 1–3; pode começar em paralelo (sugestões no dashboard) e evoluir para chat e agentes.

---

## Onde a IA entra em cada fase

| Fase | Uso de IA |
|------|-----------|
| 1 | Opcional: sugestão de legenda ou tags para foto do imóvel. |
| 2 | Agentes no WhatsApp que leem o CRM e respondem com contexto (IA + Evolution + n8n). |
| 3 | Opcional: IA para gerar legenda do post a partir dos dados do imóvel. |
| 4 | Central: intervenção (alertas), interação (assistente no painel), apoio (agente WhatsApp, qualificação, sugestão de imóveis). |

---

## Próximo passo concreto

**Iniciar Fase 1.1 – Upload de imagens:**

- Definir storage: servidor (pasta `uploads` + URL pública) ou cloud (S3, DigitalOcean Spaces, etc.).  
- Backend: modelo `ImovelFoto` (imovelId, path ou url, ordem), rota POST para upload (multipart), rota GET para listar fotos do imóvel.  
- Painel: no formulário de imóvel, componente de upload (arrastar ou selecionar), exibir preview e ordem.  
- Site: galeria na página do imóvel e thumbnail nos cards; API pública já retorna URLs das fotos.  

Com isso, você habilita site real, Instagram e envio de foto pelo WhatsApp no n8n, e prepara o terreno para IA que use imagens no futuro.

Quando quiser, podemos detalhar a Fase 1.1 (esquema de pastas, nome dos arquivos, migração Prisma e rotas) ou desenhar o primeiro fluxo n8n + Evolution para “novo lead → WhatsApp”.
