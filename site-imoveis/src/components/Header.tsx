import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="site-logo">
          {SITE_CONFIG.nome}
        </Link>
        <nav className="site-nav">
          <Link href="/">Início</Link>
          <Link href="/imoveis">Imóveis</Link>
          <Link href="/contato">Contato</Link>
          <Link href="/quem-somos">Quem somos</Link>
        </nav>
      </div>
    </header>
  );
}
