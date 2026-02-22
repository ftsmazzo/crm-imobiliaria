import { Suspense } from 'react';
import ImoveisClient from './ImoveisClient';
import { getImoveis } from '@/lib/api';

export const metadata = {
  title: 'Imóveis',
  description: 'Busque imóveis para venda e locação.',
};

export default async function ImoveisPage() {
  const imoveisIniciais = await getImoveis({ status: 'disponivel' });
  return (
    <div className="container">
      <h1>Imóveis</h1>
      <p className="lead" style={{ marginBottom: '1.5rem', color: 'var(--site-muted)' }}>
        Filtre por tipo, cidade e bairro.
      </p>
      <Suspense fallback={<p>Carregando…</p>}>
        <ImoveisClient imoveisIniciais={imoveisIniciais} />
      </Suspense>
    </div>
  );
}
