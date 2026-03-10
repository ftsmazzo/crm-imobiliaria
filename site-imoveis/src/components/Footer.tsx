'use client';

import Link from 'next/link';
import { useSiteConfig } from '@/components/SiteConfigProvider';

export default function Footer() {
  const config = useSiteConfig();
  const whatsappLink = `https://wa.me/${config.whatsapp.replace(/\D/g, '')}`;
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-col">
          <strong>{config.nome}</strong>
          <p>{config.endereco}</p>
          {config.creci && <p>CRECI: {config.creci}</p>}
        </div>
        <div className="site-footer-col">
          <strong>Links</strong>
          <Link href="/imoveis">Imóveis</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/quem-somos">Quem somos</Link>
          <Link href="/politica">Política de privacidade</Link>
        </div>
        <div className="site-footer-col">
          <strong>Atendimento</strong>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </div>
      </div>
      <div className="site-footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} {config.nome}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
