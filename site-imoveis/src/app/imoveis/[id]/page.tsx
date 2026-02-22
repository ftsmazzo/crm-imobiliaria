import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getImovel } from '@/lib/api';
import FormInteresse from './FormInteresse';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const imovel = await getImovel(id);
    const titulo = [imovel.tipo, imovel.bairro, imovel.cidade].filter(Boolean).join(' - ') || 'Imóvel';
    return { title: titulo };
  } catch {
    return { title: 'Imóvel' };
  }
}

function formatValor(v: string | null | undefined): string {
  if (!v) return '';
  const n = parseFloat(v);
  if (Number.isNaN(n)) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default async function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let imovel;
  try {
    imovel = await getImovel(id);
  } catch {
    notFound();
  }

  const endereco = [imovel.rua, imovel.numero, imovel.bairro, imovel.cidade].filter(Boolean).join(', ') || '–';
  const valorVenda = imovel.valorVenda ? formatValor(imovel.valorVenda) : null;
  const valorAluguel = imovel.valorAluguel ? formatValor(imovel.valorAluguel) : null;

  return (
    <div className="container">
      <p style={{ marginBottom: '0.5rem' }}>
        <Link href="/imoveis">← Voltar aos imóveis</Link>
      </p>
      <article className="imovel-detalhe">
        <div className="imovel-detalhe-header">
          <span className="imovel-detalhe-tipo">{imovel.tipo}</span>
          {imovel.codigo && <span className="imovel-detalhe-codigo">Cód. {imovel.codigo}</span>}
        </div>
        <div className="imovel-detalhe-imagem" />
        <div className="imovel-detalhe-body">
          <div className="imovel-detalhe-valores">
            {valorVenda && <span>Venda: {valorVenda}</span>}
            {valorAluguel && <span>Aluguel: {valorAluguel}</span>}
          </div>
          <p className="imovel-detalhe-endereco">{endereco}</p>
          <ul className="imovel-detalhe-meta">
            {imovel.qtdQuartos != null && <li>{imovel.qtdQuartos} quartos</li>}
            {imovel.qtdBanheiros != null && <li>{imovel.qtdBanheiros} banheiros</li>}
            {imovel.area && <li>{imovel.area} m²</li>}
          </ul>
          {imovel.descricao && (
            <div className="imovel-detalhe-descricao">
              <h3>Descrição</h3>
              <p>{imovel.descricao}</p>
            </div>
          )}
          <div className="imovel-detalhe-form">
            <h3>Tenho interesse</h3>
            <FormInteresse imovelId={imovel.id} />
          </div>
        </div>
      </article>
    </div>
  );
}
