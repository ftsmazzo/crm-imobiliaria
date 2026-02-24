# Estratégia de implantação – Cadastro de imóvel (ficha real)

Documento com os apontamentos do cliente (Alexsandro/Ciro) e o plano para evoluir o cadastro de imóveis: **formulário em página com abas e etapas** (não mais em modal) e inclusão dos campos/entidades da ficha real da imobiliária.

---

## 1. Resumo do pedido do cliente

- **Tipos de imóvel:** adicionar **Casa em condomínio** e **Terreno em condomínio**.
- **Empreendimento:** possibilidade de **vincular um empreendimento** (condomínio) ao imóvel.
- **Características:** m² do terreno, quantidade de sala, ano de construção, tipo de piso, lavabo.
- **Valores:** valor de **IPTU** e valor de **condomínio**.
- **Informação interna:** **quadra** e **lote** (evitar duplicidade).
- **Documentos:** aba para **IPTU** e **autorização** (anexos/info).
- **Proprietário:** **vincular proprietário** ao imóvel.

Além disso: **formulário na página em abas e etapas, não em modal** (conferir pasta **exemplos** e o PDF citado na conversa).

---

## 2. Formulário em página com abas/etapas (não modal)

### 2.1 Decisão

- **Remover** o cadastro/edição de imóvel do **modal** (wizard atual).
- **Criar** uma **página dedicada** de cadastro/edição com:
  - **Abas** ou **etapas** (stepper) no topo.
  - Conteúdo da aba/etapa ocupando a área principal da página.
  - Navegação “Anterior” / “Próximo” e “Salvar” na última etapa (ou por aba).
  - Opcional: rota por imóvel, ex.: `/imoveis/novo` e `/imoveis/:id/editar`.

### 2.2 Benefícios

- Mais espaço para cada bloco (identificação, endereço, valores, características, documentos, proprietário).
- Sem limite de altura do modal; melhor para muitos campos e anexos.
- Abas/etapas deixam a sequência clara e alinhada à ficha real.
- Possibilidade de URL direta para “novo” ou “editar imóvel X”.

### 2.3 Estrutura sugerida da página

- **Rota:** `/imoveis/novo` e `/imoveis/:id` (ou `/imoveis/:id/editar`).
- **Layout:** mesmo `AppLayout` do CRM; conteúdo em coluna única (ex.: `max-width` ~720–900px) ou em duas colunas em desktop.
- **Topo:** título (“Novo imóvel” / “Editar imóvel – Código”) + **stepper/abas** (ver seção 4).
- **Corpo:** um bloco por aba/etapa (sem scroll infinito; rolagem natural da página ou por etapa).
- **Rodapé fixo ou sticky:** Cancelar, Anterior, Próximo, Salvar (e, na aba documentos, “Enviar” se houver upload).

---

## 3. Novos tipos de imóvel

| Valor (sugerido)   | Label                  |
|-------------------|------------------------|
| `apartamento`     | Apartamento            |
| `casa`            | Casa                   |
| `casa_condominio` | Casa em condomínio     |
| `terreno`         | Terreno                |
| `terreno_condominio` | Terreno em condomínio |
| `comercial`       | Comercial              |

- Onde alterar: constante `TIPOS` no front (ex.: `Imoveis.tsx` ou componente de form), e no backend apenas validar string (ou enum se preferir).
- **Empreendimento:** quando tipo for “casa em condomínio” ou “terreno em condomínio”, o vínculo com **Empreendimento** pode ser destacado na UI (obrigatório ou sugerido conforme regra de negócio).

---

## 4. Empreendimento (condomínio) e vínculo

### 4.1 Nova entidade no backend

- **Modelo:** `Empreendimento` (condomínio / loteamento).
  - Campos sugeridos: `id`, `nome`, `descricao?`, `endereco?`, `criadoEm`, `atualizadoEm`.
  - Relação: `Imovel.empreendimentoId` (opcional) → `Empreendimento`.
- **CRUD:** listagem, criar, editar, excluir (e, se fizer sentido, listar imóveis do empreendimento).

### 4.2 No imóvel

- Campo **`empreendimentoId`** (opcional) no `Imovel`.
- No formulário: em **Identificação** ou em uma aba **“Empreendimento”** (ou “Condomínio”): combo/select de empreendimentos. Se não houver nenhum, link “Cadastrar empreendimento” (abre outra tela ou modal simples).

---

## 5. Características do imóvel (novos campos)

Incluir no modelo **Imovel** e no formulário (aba/etapa **Características**):

| Campo (sugerido no BD) | Tipo   | Descrição                    |
|------------------------|--------|------------------------------|
| `areaTerreno`          | Decimal| m² do terreno                |
| `qtdSalas`             | Int    | Quantidade de sala           |
| `anoConstrucao`        | Int    | Ano de construção            |
| `tipoPiso`             | String?| Tipo de piso (porcelanato, etc.) |
| `lavabo`               | Boolean ou Int? | Lavabo (sim/não ou quantidade) |

- No front: mesma aba “Características” onde já existem quartos, banheiros, área (m² construída); organizar em grid/linhas para não ficar poluído.
- **Área (m²)** atual pode continuar como “área construída”; `areaTerreno` = “área do terreno”.

---

## 6. Valores: IPTU e condomínio

Incluir no **Imovel** e na aba/etapa **Valores**:

| Campo (sugerido)   | Tipo    | Descrição           |
|--------------------|---------|---------------------|
| `valorIptu`        | Decimal?| Valor IPTU (mensal ou anual – definir) |
| `valorCondominio`  | Decimal?| Valor condomínio    |

- Exibir junto com “Valor venda” e “Valor aluguel” na mesma etapa “Valores e status”.
- Backend: DTOs e Prisma com `valorIptu`, `valorCondominio` (e migrations).

---

## 7. Informação interna: quadra e lote

Para **evitar duplicidade** e controle interno:

| Campo (sugerido) | Tipo   | Descrição        |
|------------------|--------|------------------|
| `quadra`         | String?| Quadra           |
| `lote`           | String?| Lote             |

- Tratar como **informação interna** (não exibir no site público, se houver).
- Colocar na **Identificação** ou em uma aba **“Interno”** (ou “Cadastro”), junto com código do imóvel.
- Backend: `Imovel.quadra`, `Imovel.lote` (opcionais).

---

## 8. Aba “IPTU e autorização”

- **Conteúdo:**
  - Dados e anexos relacionados a **IPTU** (ex.: valor de referência, vencimento, comprovante em PDF).
  - Dados e anexos de **autorização** (ex.: autorização do proprietário para venda/locação).
- **Implementação sugerida:**
  - Opção A: campos no próprio **Imovel** (ex.: `valorIptu` já previsto; `observacoesIptu?`, `observacoesAutorizacao?`) + **anexos** em tabela `ImovelDocumento` (tipo: `iptu` | `autorizacao`, arquivo/key, nome, data).
  - Opção B: só anexos em `ImovelDocumento` com tipo (iptu, autorizacao) e metadados (valor, data de vencimento, etc. em JSON ou colunas).
- **UI:** aba “IPTU e autorização” com:
  - Campos resumidos (valor IPTU, observações).
  - Upload de arquivos (PDF/imagem) para IPTU e para autorização; listagem dos anexos com opção de excluir.
- Armazenamento de arquivos: mesmo padrão das fotos (ex.: MinIO/S3), com pasta/prefixo `imoveis/{id}/documentos/`.

---

## 9. Vincular proprietário

- **Opção 1 – Reaproveitar Contato:**  
  Adicionar em **Imovel** o campo `proprietarioId` (opcional) → `Contato`.  
  “Proprietário” seria um contato com um papel específico (ex.: tipo ou tag “proprietário”).  
  Vantagem: não criar nova entidade; usar lista de contatos e filtros.

- **Opção 2 – Entidade Proprietário:**  
  Criar modelo **Proprietario** (nome, CPF, telefone, email, endereco, etc.) e `Imovel.proprietarioId` → Proprietario.  
  Vantagem: dados específicos do proprietário (CPF, dados cadastrais) separados do funil de vendas (Contato).

- **Recomendação inicial:** **Opção 1** (vínculo com Contato), com possibilidade de evoluir para Proprietário depois se o cliente precisar de CPF/documentos do proprietário na ficha.

- **UI:** na página de cadastro/edição do imóvel, aba **“Proprietário”** (ou “Proprietário / Contato”): select/autocomplete de contatos; opção “Cadastrar novo contato” se necessário.

---

## 10. Ordem de implementação sugerida

### Fase 1 – Backend (modelo e API)

1. **Migration Prisma – Imovel**
   - Novos tipos: apenas front (string); backend aceita qualquer string ou enum.
   - Novos campos em **Imovel:**  
     `areaTerreno`, `qtdSalas`, `anoConstrucao`, `tipoPiso`, `lavabo` (Int ou Boolean),  
     `valorIptu`, `valorCondominio`, `quadra`, `lote`,  
     `empreendimentoId` (FK), `proprietarioId` (FK → Contato, se Opção 1).
   - Criar modelo **Empreendimento** e relação `Imovel.empreendimentoId`.
   - Criar modelo **ImovelDocumento** (imovelId, tipo, key/nome do arquivo, ordem?, criadoEm) para anexos de IPTU/autorização.
2. **DTOs e service**
   - Atualizar `CreateImovelDto` e `UpdateImovelDto` com todos os novos campos.
   - Ajustar `ImoveisService` (create/update/findOne) para incluir `empreendimento`, `proprietario` (contato), `documentos`.
3. **Empreendimento**
   - Módulo CRUD: `EmpreendimentoController`, `EmpreendimentoService`, DTOs, listagem para select no front.
4. **Documentos do imóvel**
   - Endpoints: upload e delete de documento (tipo iptu/autorizacao); listagem por imóvel.
   - Storage: mesmo padrão das fotos (MinIO), pasta `imoveis/{id}/documentos/`.

### Fase 2 – Front: página em abas/etapas (não modal)

5. **Rotas e layout**
   - Rota `/imoveis/novo` → página “Novo imóvel” com formulário em abas/etapas.
   - Rota `/imoveis/:id` ou `/imoveis/:id/editar` → mesma página em modo edição (dados do imóvel carregados).
   - Listagem em `/imoveis`: botão “Novo” leva para `/imoveis/novo`; “Editar” leva para `/imoveis/:id/editar`.
6. **Estrutura da página**
   - Stepper ou abas no topo (Identificação, Endereço, Valores, Características, Descrição, Empreendimento?, Proprietário, Documentos IPTU/Autorização, Fotos).
   - Uma seção por aba/etapa; navegação Anterior/Próximo; Salvar na última etapa (ou “Salvar rascunho” em qualquer etapa, se desejado).
7. **Remoção do modal**
   - Remover o wizard/modal atual de cadastro/edição em `Imoveis.tsx` (ou componente que o contenha); manter apenas listagem, filtros e botões que redirecionam para as novas rotas.

### Fase 3 – Front: novos campos e vínculos

8. **Tipos e campos no form**
   - Incluir “Casa em condomínio” e “Terreno em condomínio” em **Identificação**.
   - Incluir **quadra** e **lote** em Identificação ou aba “Interno”.
   - Incluir **areaTerreno**, **qtdSalas**, **anoConstrucao**, **tipoPiso**, **lavabo** em **Características**.
   - Incluir **valorIptu** e **valorCondominio** em **Valores**.
9. **Empreendimento**
   - Select de empreendimentos (busca/lista do backend) na etapa/aba adequada; ao escolher “Casa/Terreno em condomínio”, destacar ou obrigar o vínculo.
10. **Proprietário**
    - Select/autocomplete de contatos para “Proprietário”; aba “Proprietário”.
11. **Aba IPTU e autorização**
    - Campos de texto/valor + upload e listagem de anexos (chamando API de documentos do imóvel).
12. **Fotos**
    - Manter como última aba/etapa (igual hoje, mas na página).

### Fase 4 – Ajustes e documentação

13. **CSV**
    - Atualizar modelo e mapeamento de importação CSV (colunas novas opcionais: quadra, lote, areaTerreno, valorIptu, valorCondominio, etc.) se o cliente usar importação.
14. **Site público**
    - Se houver listagem/detalhe no site: não exibir quadra, lote, valor IPTU (apenas se combinar com o cliente); exibir tipo “Casa em condomínio” / “Terreno em condomínio” e, se fizer sentido, nome do empreendimento.
15. **Exemplos**
    - Consultar a pasta **exemplos** e o **PDF** citado na conversa para alinhar nomes de campos e ordem das abas à ficha real; ajustar labels e ordem das etapas conforme necessário.

---

## 11. Pasta “exemplos” e PDF

- Foi citada uma **pasta “exemplos”** com um **PDF** da ficha de cadastro. Se ainda não existir no repositório, vale:
  - Criar `docs/exemplos/` (ou `exemplos/` na raiz) e colocar o PDF lá.
  - Usar o PDF como referência para:
    - Nomes exatos dos campos (labels).
    - Ordem das seções/abas.
    - Campos obrigatórios e opcionais.
- Após revisar o PDF, ajustar este documento (seções 3–9) e a ordem das abas na página (seção 10, itens 6–7) se necessário.

---

## 12. Checklist rápido (para começar)

- [ ] Criar pasta `exemplos` e adicionar o PDF da ficha (se disponível).
- [ ] Backend: migration com novos campos em `Imovel`, modelo `Empreendimento`, modelo `ImovelDocumento`, e `proprietarioId` → Contato.
- [ ] Backend: DTOs e services atualizados; CRUD Empreendimento; upload/list/delete de documentos.
- [ ] Front: rotas `/imoveis/novo` e `/imoveis/:id/editar` com formulário em **página** (abas/etapas).
- [ ] Front: remover cadastro/edição em modal da listagem de imóveis.
- [ ] Front: novos tipos, campos, select de empreendimento, select de proprietário (Contato), aba IPTU/autorização e fotos.
- [ ] Atualizar tipos TypeScript e CSV de importação conforme novos campos.

Com isso, o cadastro fica alinhado à ficha real, em página com abas e etapas, sem uso de modal, pronto para os ajustes finos a partir do PDF em `exemplos`.
