import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getImovel } from '@/lib/api';
import FormInteresse from './FormInteresse';
import ImovelDetalheCapaCarousel from './ImovelDetalheCapaCarousel';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const imovel = await getImovel(id, { cache: 'no-store' });
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

function formatTipo(t: string): string {
  const map: Record<string, string> = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    casa_condominio: 'Casa em condomínio',
    terreno: 'Terreno',
    terreno_condominio: 'Terreno em condomínio',
    comercial: 'Comercial',
  };
  return map[t] || t.replace(/_/g, ' ');
}

function parseCaracteristicas(s: string | null | undefined): string[] {
  if (!s || !s.trim()) return [];
  try {
    const arr = JSON.parse(s);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export default async function ImovelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let imovel;
  try {
    imovel = await getImovel(id, { cache: 'no-store' });
  } catch {
    // 404 (não encontrado) ou 400 (id inválido): exibir página não encontrada
    notFound();
  }

  const exibirEndereco = imovel.exibirEnderecoSite !== false;
  const enderecoTexto = exibirEndereco
    ? ([imovel.rua, imovel.numero, imovel.bairro, imovel.cidade].filter(Boolean).join(', ') || '–')
    : 'Endereço sob consulta';
  const valorVenda = imovel.valorVenda ? formatValor(imovel.valorVenda) : null;
  const valorAluguel = imovel.valorAluguel ? formatValor(imovel.valorAluguel) : null;
  const valorIptu = imovel.valorIptu ? formatValor(imovel.valorIptu) : null;
  const valorCondominio = imovel.valorCondominio ? formatValor(imovel.valorCondominio) : null;
  const fotos = imovel.fotos ?? [];
  const caracteristicas = parseCaracteristicas(imovel.caracteristicas);
  const tipoVagaLabel = imovel.tipoVaga === 'coberta' ? 'Coberta' : imovel.tipoVaga === 'descoberta' ? 'Descoberta' : imovel.tipoVaga === 'ambos' ? 'Coberta e descoberta' : null;

  return (
    <div className="container container-detalhe">
      <p className="imovel-voltar">
        <Link href="/imoveis">← Voltar aos imóveis</Link>
      </p>
      <article className="imovel-detalhe">
        <header className="imovel-detalhe-header">
          <div className="imovel-detalhe-header-top">
            <span className="imovel-detalhe-tipo">{formatTipo(imovel.tipo)}</span>
            {imovel.codigo && <span className="imovel-detalhe-codigo">Cód. {imovel.codigo}</span>}
          </div>
          {(imovel.bairro || imovel.cidade) && (
            <p className="imovel-detalhe-local">
              {[imovel.bairro, imovel.cidade].filter(Boolean).join(', ')}
            </p>
          )}
        </header>

        <div className="imovel-detalhe-capa">
          <ImovelDetalheCapaCarousel fotos={fotos} />
        </div>

        <div className="imovel-detalhe-body">
          <section className="imovel-detalhe-valores-cart">
            <h2 className="imovel-detalhe-secao-titulo">Valores</h2>
            <div className="imovel-detalhe-valores-grid">
              {valorVenda && (
                <div className="imovel-detalhe-valor-item">
                  <span className="imovel-detalhe-valor-label">Venda</span>
                  <span className="imovel-detalhe-valor-numero">{valorVenda}</span>
                </div>
              )}
              {valorAluguel && (
                <div className="imovel-detalhe-valor-item">
                  <span className="imovel-detalhe-valor-label">Aluguel</span>
                  <span className="imovel-detalhe-valor-numero">{valorAluguel}</span>
                </div>
              )}
              {valorIptu && (
                <div className="imovel-detalhe-valor-item imovel-detalhe-valor-sec">
                  <span className="imovel-detalhe-valor-label">IPTU</span>
                  <span className="imovel-detalhe-valor-numero">{valorIptu}</span>
                </div>
              )}
              {valorCondominio && (
                <div className="imovel-detalhe-valor-item imovel-detalhe-valor-sec">
                  <span className="imovel-detalhe-valor-label">Condomínio</span>
                  <span className="imovel-detalhe-valor-numero">{valorCondominio}</span>
                </div>
              )}
            </div>
          </section>

          <section className="imovel-detalhe-endereco-secao">
            <h2 className="imovel-detalhe-secao-titulo">Localização</h2>
            <p className="imovel-detalhe-endereco">{enderecoTexto}</p>
          </section>

          <section className="imovel-detalhe-meta-secao">
            <h2 className="imovel-detalhe-secao-titulo">Resumo</h2>
            <ul className="imovel-detalhe-meta">
              {imovel.qtdQuartos != null && <li>{imovel.qtdQuartos} quartos</li>}
              {imovel.qtdBanheiros != null && <li>{imovel.qtdBanheiros} banheiros</li>}
              {imovel.qtdSalas != null && imovel.qtdSalas > 0 && <li>{imovel.qtdSalas} salas</li>}
              {imovel.lavabo != null && imovel.lavabo > 0 && <li>{imovel.lavabo} lavabo(s)</li>}
              {imovel.area != null && <li>{imovel.area} m² área</li>}
              {imovel.areaTerreno != null && <li>{imovel.areaTerreno} m² terreno</li>}
              {imovel.qtdVagas != null && imovel.qtdVagas > 0 && (
                <li>{imovel.qtdVagas} vaga(s){tipoVagaLabel ? ` (${tipoVagaLabel})` : ''}</li>
              )}
              {imovel.anoConstrucao != null && <li>Ano {imovel.anoConstrucao}</li>}
              {imovel.tipoPiso && <li>Piso: {imovel.tipoPiso}</li>}
              {imovel.andarUnidade != null && <li>{imovel.andarUnidade}º andar</li>}
            </ul>
          </section>

          {caracteristicas.length > 0 && (
            <section className="imovel-detalhe-carac-secao">
              <h2 className="imovel-detalhe-secao-titulo">Características</h2>
              <ul className="imovel-detalhe-carac-lista">
                {caracteristicas.map((c) => (
                  <li key={c}>{c.replace(/_/g, ' ')}</li>
                ))}
              </ul>
            </section>
          )}

          {(imovel.pontosReferencia || imovel.eletrodomesticos) && (
            <section className="imovel-detalhe-extras-secao">
              <h2 className="imovel-detalhe-secao-titulo">Extras</h2>
              {imovel.pontosReferencia && (
                <p><strong>Pontos de referência:</strong> {imovel.pontosReferencia}</p>
              )}
              {imovel.eletrodomesticos && (
                <p><strong>Eletrodomésticos:</strong> {imovel.eletrodomesticos}</p>
              )}
            </section>
          )}

          {imovel.descricao && (
            <section className="imovel-detalhe-descricao">
              <h2 className="imovel-detalhe-secao-titulo">Descrição</h2>
              <p>{imovel.descricao}</p>
            </section>
          )}

          <section className="imovel-detalhe-form">
            <h2 className="imovel-detalhe-secao-titulo">Tenho interesse</h2>
            <FormInteresse imovelId={imovel.id} />
          </section>
        </div>
      </article>
    </div>
  );
}
