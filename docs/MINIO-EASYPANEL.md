# MinIO no EasyPanel – uso para fotos dos imóveis

O MinIO oferecido pelo EasyPanel é o **MinIO padrão** (imagem `minio/minio:latest`). Ele **não é uma versão limitada**: depois de subir o app, você usa o **Console web do MinIO** para criar buckets, access keys e políticas. A parte “mais restrita” é só o **formulário de deploy** no EasyPanel (nome do serviço, usuário/senha do Console); o restante você configura no próprio MinIO.

---

## O que o EasyPanel configura na hora do deploy

No template MinIO do EasyPanel costumam existir apenas:

| Opção        | Descrição                          |
|-------------|------------------------------------|
| Service Name| Nome do app (ex.: `minio`)         |
| Image       | `minio/minio:latest`               |
| Username   | Login do **Console web** (ex.: admin) |
| Password   | Senha do **Console web**            |

Ou seja: o painel só define **como acessar a interface web do MinIO**. Não cria bucket nem access key por lá.

---

## O que você faz depois (no Console do MinIO)

1. **Abrir o Console**
   - No EasyPanel, o app MinIO costuma expor uma porta (ex.: 9001 para o Console).
   - Você pode publicar o serviço (domínio ou porta) e acessar: `http(s)://seu-minio:9001` (ou a URL que o EasyPanel mostrar).
   - Login: usuário e senha que você definiu no deploy.

2. **Criar o bucket**
   - No Console: **Buckets** → **Create Bucket**.
   - Nome sugerido: `crm-imoveis` (ou outro que for usar no backend).
   - Região: ex. `us-east-1` (pode deixar o padrão).

3. **Criar Access Key e Secret (para o backend)**
   - No Console: **Access Keys** (ou **Identity** → **Service Accounts** / **Access Keys**, conforme a versão).
   - **Create access key**.
   - Guarde o **Access Key** e o **Secret Key**: o backend do CRM vai usar como `MINIO_ACCESS_KEY` e `MINIO_SECRET_KEY` para enviar as fotos via API S3.

4. **Política (recomendado)**
   - Crie uma política que permita apenas esse bucket para essa access key (leitura/escrita no `crm-imoveis`), ou use a política padrão que o MinIO associa à nova chave, se for suficiente.

---

## Bucket PRIVATE e sem botão "Edit policy" na interface

Na interface **Object Browser** (MinIO Object Store – Community Edition) atual, **não aparece** opção para alterar a política do bucket (nada de "Edit policy" ou "Make public" como nas versões antigas do Console). O bucket fica **Access: PRIVATE** e a UI não oferece onde mudar isso.

Você tem duas saídas:

### Opção A – Deixar o bucket privado e usar **URLs assinadas** (recomendado)

- O bucket continua **PRIVATE**.
- O **backend do CRM** usa a Access Key e o Secret para gerar **presigned URLs** (URLs temporárias com assinatura) quando o site ou o painel precisam exibir a foto.
- Vantagens: mais seguro, não expõe o bucket ao mundo; não precisa mudar nada no MinIO.
- Na implementação do upload, o backend retorna para o front não a URL pública do objeto, e sim um endpoint nosso que gera e redireciona para a presigned URL (ex.: `GET /api/public/imoveis/:id/fotos/:fotoId/url`).

**Para o nosso caso (fotos dos imóveis), essa é a abordagem recomendada.**

### Opção B – Deixar o bucket com leitura pública (via linha de comando)

Se você **realmente** quiser que os objetos do bucket sejam acessíveis por URL pública (qualquer um com o link pode ver), dá para configurar pelo **MinIO Client (`mc`)** no servidor:

1. Instale o [MinIO Client (mc)](https://min.io/docs/minio/linux/reference/minio-mc.html) ou use um container/pod que tenha `mc`.
2. Configure um alias apontando para o seu MinIO (host, access key, secret).
3. Defina política anônima de **download** no bucket:

```bash
mc alias set myminio http://SEU_MINIO:9000 SEU_ACCESS_KEY SEU_SECRET_KEY
mc anonymous set download myminio/crm
```

Assim o bucket `crm` fica com leitura pública (download). Não é obrigatório fazer isso: para o CRM, a **Opção A (presigned URLs)** é suficiente e mais segura.

---

## Funciona para o nosso caso?

Sim. O fluxo é:

1. **EasyPanel:** sobe o MinIO (só usuário/senha do Console).
2. **Você:** no Console do MinIO cria bucket `crm-imoveis` e gera Access Key + Secret.
3. **Backend do CRM:** usa variáveis de ambiente (endpoint do MinIO, bucket, access key, secret) e biblioteca S3-compatível (ex.: `@aws-sdk/client-s3` ou `minio`) para fazer upload das fotos e gerar URL (pública ou assinada) para o site/painel.

Ou seja: a versão self-hosted de MinIO no EasyPanel **funciona** para armazenar as fotos dos imóveis; a diferença para “versões antigas” que você usava é só que buckets e secrets são criados **dentro do Console do MinIO**, e não em telas do próprio EasyPanel.

---

## Variáveis para o backend (quando implementarmos upload)

Exemplo do que o backend vai precisar (e você pode colocar no EasyPanel como env do backend):

| Variável           | Exemplo (ajuste ao seu ambiente) |
|--------------------|----------------------------------|
| `MINIO_ENDPOINT`   | `http://minio:9000` (rede interna) ou URL pública se o backend estiver fora do EasyPanel |
| `MINIO_BUCKET`     | `crm-imoveis`                    |
| `MINIO_ACCESS_KEY` | (a chave criada no Console)      |
| `MINIO_SECRET_KEY` | (o secret criado no Console)     |
| `MINIO_USE_SSL`    | `false` (ou `true` se usar HTTPS)|

Se o backend e o MinIO rodarem na mesma rede no EasyPanel, o endpoint pode ser `http://minio:9000` (nome do serviço = host).

---

## Resumo

- **É o MinIO completo:** buckets, access keys, secrets e políticas são configurados no **Console web do MinIO** após o deploy.
- **EasyPanel só “restringe”** o que aparece no formulário de instalação (serviço + login do Console); o resto é igual a qualquer MinIO self-hosted.
- **Funciona para nós:** dá para usar esse MinIO como storage das fotos dos imóveis; o próximo passo técnico é implementar no backend o upload S3-compatível e as variáveis acima.
