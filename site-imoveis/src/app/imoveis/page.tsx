import { Suspense } from 'react';
import ImoveisClient from './ImoveisClient';
import { getImoveis } from '@/lib/api';

export const metadata = {
  title: 'Imóveis',
  description: 'Busque imóveis para venda e locação.',
};

type SearchParams = { cidade?: string; bairro?: string; tipo?: string; finalidade?: string };

export default async function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const imoveisIniciais = await getImoveis({
    status: 'disponivel',
    cidade: params.cidade || undefined,
    bairro: params.bairro || undefined,
    tipo: params.tipo || undefined,
  });
  return (
    <div className="container">
      <header className="imoveis-page-header">
        <h1 className="imoveis-page-title">Imóveis</h1>
        <p className="imoveis-page-lead">Encontre o imóvel ideal. Filtre por cidade, bairro, tipo e finalidade.</p>
      </header>
      <Suspense fallback={<p className="imoveis-loading">Carregando…</p>}>
        <ImoveisClient
          imoveisIniciais={imoveisIniciais}
          initialCidade={params.cidade ?? ''}
          initialBairro={params.bairro ?? ''}
          initialTipo={params.tipo ?? ''}
          initialFinalidade={params.finalidade ?? ''}
        />
      </Suspense>
    </div>
  );
}
