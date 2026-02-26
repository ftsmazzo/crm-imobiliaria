import Link from 'next/link';
import { getImoveis } from '@/lib/api';
import ImovelCard from '@/components/ImovelCard';

export default async function Home() {
  // Sem cache: lista sempre atualizada (excluídos não aparecem)
  const destaque = await getImoveis(
    { status: 'disponivel', destaque: true },
    { cache: 'no-store' },
  );

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Encontre o imóvel ideal</h1>
          <p className="hero-lead">Venda e locação com atendimento personalizado.</p>
          <Link href="/imoveis" className="btn btn-primary">
            Ver imóveis
          </Link>
        </div>
      </section>

      <section className="container" style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Imóveis em destaque</h2>
        {destaque.length === 0 ? (
          <p style={{ color: 'var(--site-muted)' }}>
            Nenhum imóvel em destaque no momento. <Link href="/imoveis">Ver todos os imóveis</Link>
          </p>
        ) : (
          <div className="imovel-grid">
            {destaque.map((i) => (
              <ImovelCard key={i.id} imovel={i} />
            ))}
          </div>
        )}
        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link href="/imoveis" className="btn btn-outline">
            Ver todos os imóveis
          </Link>
        </p>
      </section>
    </>
  );
}
