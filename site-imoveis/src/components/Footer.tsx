import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config';

export default function Footer() {
  const whatsappLink = `https://wa.me/${SITE_CONFIG.whatsapp.replace(/\D/g, '')}`;
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <div className="site-footer-col">
          <strong>{SITE_CONFIG.nome}</strong>
          <p>{SITE_CONFIG.endereco}</p>
          {SITE_CONFIG.creci && <p>CRECI: {SITE_CONFIG.creci}</p>}
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
          © {new Date().getFullYear()} {SITE_CONFIG.nome}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
