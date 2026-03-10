'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-logo" onClick={() => setMenuOpen(false)}>
          {SITE_CONFIG.nome}
        </Link>
        <nav className="site-nav">
          <Link href="/">Início</Link>
          <Link href="/imoveis">Imóveis</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/quem-somos">Quem somos</Link>
          <Link href="/contato" className="site-nav-cta">
            Fale conosco
          </Link>
        </nav>
        <button
          type="button"
          className="site-header-menu-btn"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>
      {menuOpen && (
        <div className="container">
          <nav className="site-mobile-nav" aria-label="Menu móvel">
            <Link href="/" onClick={() => setMenuOpen(false)}>Início</Link>
            <Link href="/imoveis" onClick={() => setMenuOpen(false)}>Imóveis</Link>
            <Link href="/contato" onClick={() => setMenuOpen(false)}>Contato</Link>
            <Link href="/quem-somos" onClick={() => setMenuOpen(false)}>Quem somos</Link>
            <Link href="/contato" className="site-nav-cta" onClick={() => setMenuOpen(false)} style={{ marginTop: '0.5rem', display: 'inline-block', textAlign: 'center' }}>
              Fale conosco
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
