-- Padroniza código dos imóveis por tipo: AP, CA, TR, CAC, TRC, COM + numeração sequencial
-- Ordem por tipo: criado_em, id

WITH numbered AS (
  SELECT
    id,
    tipo,
    ROW_NUMBER() OVER (PARTITION BY tipo ORDER BY "criado_em", id) AS rn
  FROM "Imovel"
),
prefixed AS (
  SELECT
    id,
    CASE tipo
      WHEN 'apartamento'       THEN 'AP-'  || LPAD(rn::text, 5, '0')
      WHEN 'casa'              THEN 'CA-'  || LPAD(rn::text, 5, '0')
      WHEN 'terreno'           THEN 'TR-'  || LPAD(rn::text, 5, '0')
      WHEN 'casa_condominio'   THEN 'CAC-' || LPAD(rn::text, 5, '0')
      WHEN 'terreno_condominio' THEN 'TRC-' || LPAD(rn::text, 5, '0')
      WHEN 'comercial'         THEN 'COM-' || LPAD(rn::text, 5, '0')
      ELSE 'IMV-' || LPAD(rn::text, 5, '0')
    END AS codigo
  FROM numbered
)
UPDATE "Imovel" i
SET codigo = p.codigo
FROM prefixed p
WHERE i.id = p.id;
