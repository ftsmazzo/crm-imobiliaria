# Fotos e capa no site público

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
