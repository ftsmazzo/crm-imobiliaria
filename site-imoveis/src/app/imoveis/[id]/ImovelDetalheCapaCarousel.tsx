'use client';

import { useState, useEffect } from 'react';
import type { ImovelFotoPublic } from '@/lib/api';

const CAROUSEL_INTERVAL_MS = 4500;

export default function ImovelDetalheCapaCarousel({ fotos }: { fotos: ImovelFotoPublic[] }) {
  const [index, setIndex] = useState(0);
  const foto = fotos.length > 0 ? fotos[index % fotos.length] : null;

  useEffect(() => {
    if (fotos.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % fotos.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [fotos.length]);

  if (fotos.length === 0) {
    return (
      <div className="imovel-detalhe-capa-carousel imovel-detalhe-capa-carousel--empty">
        <div className="imovel-detalhe-capa-placeholder">
          <span className="imovel-detalhe-capa-icon" aria-hidden>🏠</span>
        </div>
      </div>
    );
  }

  return (
    <div className="imovel-detalhe-capa-carousel">
      <img src={foto!.url} alt="" className="imovel-detalhe-capa-img" />
      {fotos.length > 1 && (
        <div className="imovel-detalhe-capa-carousel-dots" aria-hidden>
          {fotos.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`imovel-detalhe-capa-carousel-dot ${i === index ? 'active' : ''}`}
              aria-label={`Foto ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
