'use client';

import { useState, useRef, useEffect } from 'react';
import type { ImovelFotoPublic } from '@/lib/api';

export default function ImovelDetalheCapaCarousel({ fotos }: { fotos: ImovelFotoPublic[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const foto = fotos.length > 0 ? fotos[index % fotos.length] : null;

  // Centralizar thumbnail ativo na faixa
  useEffect(() => {
    if (fotos.length <= 1 || !stripRef.current) return;
    const el = stripRef.current.querySelector(`[data-index="${index}"]`);
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [index, fotos.length]);

  const goTo = (i: number) => {
    if (i === index) return;
    setDirection(i > index ? 'next' : 'prev');
    setIndex(i);
    setTimeout(() => setDirection(null), 350);
  };

  const goPrev = () => {
    setDirection('prev');
    setIndex((i) => (i - 1 + fotos.length) % fotos.length);
    setTimeout(() => setDirection(null), 350);
  };

  const goNext = () => {
    setDirection('next');
    setIndex((i) => (i + 1) % fotos.length);
    setTimeout(() => setDirection(null), 350);
  };

  if (fotos.length === 0) {
    return (
      <div className="imovel-detalhe-galeria-layout">
        <div className="imovel-detalhe-capa-main imovel-detalhe-capa-carousel--empty">
          <div className="imovel-detalhe-capa-placeholder">
            <span className="imovel-detalhe-capa-icon" aria-hidden>🏠</span>
          </div>
        </div>
        <div className="imovel-detalhe-capa-thumbs" />
      </div>
    );
  }

  return (
    <div className="imovel-detalhe-galeria-layout">
      <div className="imovel-detalhe-capa-main">
        <div className="imovel-detalhe-capa-main-inner">
          <img
            key={index}
            src={foto!.url}
            alt=""
            className={`imovel-detalhe-capa-img ${direction ? `imovel-detalhe-capa-img--${direction}` : ''}`}
          />
        </div>
        {fotos.length > 1 && (
          <>
            <button
              type="button"
              className="imovel-detalhe-capa-nav imovel-detalhe-capa-nav--prev"
              onClick={goPrev}
              aria-label="Foto anterior"
            />
            <button
              type="button"
              className="imovel-detalhe-capa-nav imovel-detalhe-capa-nav--next"
              onClick={goNext}
              aria-label="Próxima foto"
            />
          </>
        )}
      </div>
      {fotos.length > 1 && (
        <div className="imovel-detalhe-capa-thumbs">
          <div className="imovel-detalhe-capa-thumbs-strip" ref={stripRef}>
            {fotos.map((f, i) => (
              <button
                key={f.id}
                type="button"
                className={`imovel-detalhe-capa-thumb ${i === index ? 'active' : ''}`}
                onClick={() => goTo(i)}
                data-index={i}
                aria-label={`Foto ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              >
                <img src={f.url} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
