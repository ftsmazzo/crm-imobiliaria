import Link from 'next/link';
import type { ImovelPublic } from '@/lib/api';

function formatValor(v: string | null | undefined): string {
  if (!v) return '';
  const n = parseFloat(v);
  if (Number.isNaN(n)) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function ImovelCard({ imovel }: { imovel: ImovelPublic }) {
  const valor = imovel.valorVenda ? formatValor(imovel.valorVenda) : imovel.valorAluguel ? formatValor(imovel.valorAluguel) : '';
  const subtipo = imovel.valorVenda && imovel.valorAluguel ? 'Venda e locação' : imovel.valorVenda ? 'Venda' : 'Locação';
  const endereco = [imovel.bairro, imovel.cidade].filter(Boolean).join(', ') || '–';
  return (
    <Link href={`/imoveis/${imovel.id}`} className="imovel-card">
      <div className="imovel-card-image">
        {imovel.fotos?.[0]?.url ? (
          <img src={imovel.fotos[0].url} alt="" className="imovel-card-img" />
        ) : null}
        <span className="imovel-card-tipo">{imovel.tipo}</span>
      </div>
      <div className="imovel-card-body">
        <p className="imovel-card-valor">{valor}</p>
        <p className="imovel-card-subtipo">{subtipo}</p>
        <p className="imovel-card-endereco">{endereco}</p>
        <div className="imovel-card-meta">
          {imovel.qtdQuartos != null && <span>{imovel.qtdQuartos} quartos</span>}
          {imovel.qtdBanheiros != null && <span>{imovel.qtdBanheiros} banh.</span>}
          {imovel.area && <span>{imovel.area} m²</span>}
        </div>
      </div>
    </Link>
  );
}
