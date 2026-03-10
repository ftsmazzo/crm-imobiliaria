import Link from 'next/link';
import { getImoveis } from '@/lib/api';
import ImovelCard from '@/components/ImovelCard';
import HeroSearch from '@/components/HeroSearch';
import HeroSection from '@/components/HeroSection';

export default async function Home() {
  const destaque = await getImoveis(
    { status: 'disponivel', destaque: true },
    { cache: 'no-store' },
  );

  return (
    <>
      <HeroSection>
        <h1>Encontre o imóvel ideal</h1>
        <HeroSearch />
      </HeroSection>

      <section className="container" style={{ marginTop: 'var(--site-space-12)' }}>
        <h2 className="section-title">Imóveis em destaque</h2>
        <p className="section-subtitle">
          Seleção de imóveis disponíveis para você.
        </p>
        {destaque.length === 0 ? (
          <p className="imoveis-empty-msg">
            Nenhum imóvel em destaque no momento. <Link href="/imoveis">Ver todos os imóveis</Link>
          </p>
        ) : (
          <div className="imovel-grid">
            {destaque.map((i) => (
              <ImovelCard key={i.id} imovel={i} />
            ))}
          </div>
        )}
        <p style={{ marginTop: 'var(--site-space-8)', textAlign: 'center' }}>
          <Link href="/imoveis" className="btn btn-outline">
            Ver todos os imóveis
          </Link>
        </p>
      </section>
    </>
  );
}
