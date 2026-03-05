# Desenho: Documentos PDF no sistema

## Dois contextos

1. **Documentos do imóvel** (detalhe do imóvel)  
   - Já existe modelo `ImovelDocumento` (tipo: iptu, autorizacao, etc.).  
   - Onde: tela de detalhe do imóvel.  
   - Uso: consulta e download (ex.: IPTU, autorização do proprietário).

2. **Documentos do processo (cliente + imóvel)**  
   - Relacionados ao processo de aluguel/compra (proposta, contrato, laudo, etc.).  
   - Vinculados a contato e, opcionalmente, a imóvel.  
   - Onde: no detalhe do lead (modal) e/ou em uma aba “Documentos” do processo.

## Armazenamento

- **MinIO** (já usado para fotos do imóvel): mesmo bucket ou subpasta para documentos.  
- Chave sugerida: `documentos/imovel/{imovelId}/{uuid}_{nome}` e `documentos/processo/{contatoId}/{uuid}_{nome}`.

## Funcionalidades

- **Upload**: campo de upload (arrastar ou selecionar); aceitar PDF e, opcionalmente, outros formatos (conversão para PDF como plus).  
- **Registro em banco**: tabelas `ImovelDocumento` (já existe) e nova `ProcessoDocumento` (contatoId, imovelId?, tipoDocumentoId?, key, nomeOriginal, criadoEm).  
- **Tipos de documento**: tabela `TipoDocumento` (id, nome, contexto: 'imovel' | 'processo') para listar em dropdown e em telas de listagem.  
- **Listagem**: listar documentos por imóvel e por processo (contato + imóvel).  
- **Download**: link para baixar (URL assinada MinIO ou endpoint de download).  
- **Visualizar PDF no sistema**: abrir em nova aba ou iframe com URL assinada (evitar download direto se quiser “só ver”).

## Plus (opcional)

- Se o arquivo enviado não for PDF (ex.: Word, imagem), converter para PDF no backend antes de salvar (lib ou serviço externo), para padronizar e facilitar visualização.

## Ordem de implementação sugerida

1. **Documentos do imóvel**  
   - Backend: endpoint upload (MinIO), listagem, URL de visualização/download.  
   - Front: na tela de detalhe do imóvel, seção “Documentos” com lista, upload e botão “Ver” (abre PDF em nova aba).

2. **Tipos de documento**  
   - Backend: CRUD de `TipoDocumento` (ou seed fixo no início).  
   - Front: select de tipo no upload.

3. **Documentos do processo**  
   - Backend: modelo `ProcessoDocumento`, upload/listagem por contato (e opcional imóvel).  
   - Front: no modal do lead ou aba “Documentos do processo”, lista + upload + visualizar.

4. **Conversão para PDF** (se fizer sentido)  
   - Backend: após upload, se mimetype != application/pdf, converter (ex.: LibreOffice headless ou lib Node) e salvar o PDF; manter nome original em metadado.
