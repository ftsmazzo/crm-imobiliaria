# Fotos e capa no site público

Para testar localmente: suba o backend (ex.: porta 3000) e o site em `site-imoveis` (ex.: `npm run dev`). O site usa `NEXT_PUBLIC_API_URL` ou `http://localhost:3000` por padrão. Marque imóveis como destaque no CRM e defina a foto de capa na etapa Fotos do cadastro; a página inicial e a listagem/detalhe do site exibem o carousel automaticamente.

## API Pública

- **GET /api/public/imoveis** e **GET /api/public/imoveis/:id** retornam, para cada imóvel, um array `fotos` com `{ id, url, capa }`.
- As fotos vêm **ordenadas**: primeiro a foto de capa (se houver uma marcada), depois as demais por ordem. Assim, `fotos[0]` é sempre a imagem principal para o site.
- O campo `capa: true` indica qual foto foi definida como capa no CRM (em Cadastro/Edição do imóvel, etapa Fotos, botão "Definir como capa").

## Carousel nos imóveis em destaque

Para exibir um **carousel automático** nos imóveis em destaque no site:

1. Use o array `fotos` retornado pela API (já na ordem desejada).
2. Exiba o carousel com todas as fotos; a primeira (`fotos[0]`) pode ser a imagem inicial.
3. Rotação automática: troque a foto exibida a cada X segundos (ex.: 4s), em ciclo, usando o mesmo array.

Exemplo de estrutura no front do site:

- Estado: `fotoAtualIndex = 0`.
- Intervalo: a cada 4s, `setFotoAtualIndex((i + 1) % fotos.length)`.
- Render: `<img src={fotos[fotoAtualIndex].url} alt="..." />` e opcionalmente indicadores/thumbnails.

Nenhuma alteração adicional na API é necessária para o carousel; a ordem e o campo `capa` já atendem ao uso.
