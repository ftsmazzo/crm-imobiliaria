'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ImovelFotoPublic } from '@/lib/api';

export default function ImovelDetalheCapaCarousel({ fotos }: { fotos: ImovelFotoPublic[] }) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const foto = fotos.length > 0 ? fotos[index % fotos.length] : null;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (fotos.length <= 1 || !stripRef.current) return;
    const el = stripRef.current.querySelector(`[data-index="${index}"]`);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }, [index, fotos.length]);

  const goTo = useCallback((i: number) => {
    setIndex(i);
  }, []);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + fotos.length) % fotos.length);
  }, [fotos.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % fotos.length);
  }, [fotos.length]);

  const openLightbox = useCallback(() => {
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (fotos.length <= 1) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxOpen, fotos.length, closeLightbox, goNext, goPrev]);

  if (fotos.length === 0) {
    return (
      <div className="imovel-detalhe-galeria-layout">
        <div className="imovel-detalhe-capa-main imovel-detalhe-capa-carousel--empty">
          <div className="imovel-detalhe-capa-placeholder">
            <span className="imovel-detalhe-capa-icon" aria-hidden>
              🏠
            </span>
          </div>
        </div>
        <div className="imovel-detalhe-capa-thumbs imovel-detalhe-capa-thumbs--empty" aria-hidden />
      </div>
    );
  }

  const lightbox =
    mounted &&
    lightboxOpen &&
    createPortal(
      <div className="imovel-lightbox" role="dialog" aria-modal="true" aria-label="Fotos em tamanho ampliado">
        <button type="button" className="imovel-lightbox-backdrop" onClick={closeLightbox} aria-label="Fechar galeria" />
        <div className="imovel-lightbox-inner">
          <button
            ref={closeBtnRef}
            type="button"
            className="imovel-lightbox-close"
            onClick={closeLightbox}
            aria-label="Fechar"
          >
            ×
          </button>
          {fotos.length > 1 && (
            <>
              <button type="button" className="imovel-lightbox-nav imovel-lightbox-nav--prev" onClick={goPrev} aria-label="Foto anterior" />
              <button type="button" className="imovel-lightbox-nav imovel-lightbox-nav--next" onClick={goNext} aria-label="Próxima foto" />
            </>
          )}
          <div className="imovel-lightbox-stage">
            <img src={foto!.url} alt="" className="imovel-lightbox-img" />
          </div>
          {fotos.length > 1 && (
            <p className="imovel-lightbox-counter" aria-live="polite">
              {index + 1} / {fotos.length}
            </p>
          )}
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <div className="imovel-detalhe-galeria-layout">
        <div className="imovel-detalhe-capa-main">
          <div className="imovel-detalhe-capa-main-inner">
            <button
              type="button"
              className="imovel-detalhe-capa-zoom-trigger"
              onClick={openLightbox}
              aria-label="Ampliar foto"
            >
              <img key={index} src={foto!.url} alt="" className="imovel-detalhe-capa-img" />
            </button>
          </div>
          <p className="imovel-detalhe-capa-hint">Clique na foto para ver em tamanho real</p>
        </div>
        {fotos.length > 1 && (
          <aside className="imovel-detalhe-capa-thumbs" aria-label="Miniaturas">
            <p className="imovel-detalhe-capa-thumbs-title">Fotos</p>
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
          </aside>
        )}
      </div>
      {lightbox}
    </>
  );
}
