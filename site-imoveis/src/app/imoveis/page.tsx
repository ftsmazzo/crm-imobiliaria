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
      <header className="imoveis-page-header">
        <h1 className="imoveis-page-title">Imóveis</h1>
        <p className="imoveis-page-lead">Encontre o imóvel ideal. Filtre por tipo, cidade e bairro.</p>
      </header>
      <Suspense fallback={<p className="imoveis-loading">Carregando…</p>}>
        <ImoveisClient imoveisIniciais={imoveisIniciais} />
      </Suspense>
    </div>
  );
}
