'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ImovelPublic } from '@/lib/api';

const CAROUSEL_INTERVAL_MS = 4500;

const TIPO_LABEL: Record<string, string> = {
  apartamento: 'Apto',
  casa: 'Casa',
  casa_condominio: 'Casa cond.',
  terreno: 'Terreno',
  terreno_condominio: 'Terreno cond.',
  comercial: 'Comercial',
};

function formatValor(v: string | null | undefined): string {
  if (!v) return '';
  const n = parseFloat(v);
  if (Number.isNaN(n)) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);
}

export default function ImovelCard({ imovel }: { imovel: ImovelPublic }) {
  const temVenda = !!imovel.valorVenda;
  const temAluguel = !!imovel.valorAluguel;
  const valor = temVenda ? formatValor(imovel.valorVenda) : temAluguel ? formatValor(imovel.valorAluguel) : 'Consultar';
  const exibirEndereco = imovel.exibirEnderecoSite !== false;
  const endereco = exibirEndereco
    ? ([imovel.bairro, imovel.cidade].filter(Boolean).join(', ') || '–')
    : 'Consultar';
  const fotos = imovel.fotos ?? [];
  const [photoIndex, setPhotoIndex] = useState(0);
  const fotoAtual = fotos.length > 0 ? fotos[photoIndex % fotos.length] : null;

  useEffect(() => {
    if (fotos.length <= 1) return;
    const t = setInterval(() => {
      setPhotoIndex((i) => (i + 1) % fotos.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fotos.length]);

  return (
    <Link href={`/imoveis/${imovel.id}`} className="imovel-card">
      <div className="imovel-card-capa">
        {fotoAtual?.url ? (
          <img src={fotoAtual.url} alt="" className="imovel-card-capa-img" loading="lazy" />
        ) : (
          <div className="imovel-card-capa-placeholder" aria-hidden>
            <span className="imovel-card-capa-icon">🏠</span>
          </div>
        )}
        <div className="imovel-card-badges">
          {temVenda && <span className="imovel-card-badge imovel-card-badge--venda">Venda</span>}
          {temAluguel && <span className="imovel-card-badge imovel-card-badge--aluguel">Locação</span>}
          <span className="imovel-card-badge imovel-card-badge--tipo">
            {TIPO_LABEL[imovel.tipo] || imovel.tipo}
          </span>
        </div>
        {fotos.length > 1 && (
          <div className="imovel-card-carousel-dots" aria-hidden>
            {fotos.map((_, i) => (
              <span
                key={i}
                className={`imovel-card-carousel-dot ${i === photoIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="imovel-card-body">
        <p className="imovel-card-valor">{valor}</p>
        <p className="imovel-card-endereco">{endereco}</p>
        <div className="imovel-card-meta">
          {imovel.qtdQuartos != null && <span>{imovel.qtdQuartos} quartos</span>}
          {imovel.qtdBanheiros != null && <span>{imovel.qtdBanheiros} banh.</span>}
          {imovel.area && <span>{imovel.area} m²</span>}
        </div>
      </div>
    </Link>
  );
}
