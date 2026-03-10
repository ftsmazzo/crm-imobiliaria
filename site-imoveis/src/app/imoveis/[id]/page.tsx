import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getImovel, getSiteConfig } from '@/lib/api';
import FormInteresse from './FormInteresse';
import ImovelDetalheCapaCarousel from './ImovelDetalheCapaCarousel';
import { SITE_CONFIG } from '@/lib/config';

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
  const valorPrincipal = valorVenda || valorAluguel || 'Consultar';
  const fotos = imovel.fotos ?? [];
  const caracteristicas = parseCaracteristicas(imovel.caracteristicas);
  const tipoVagaLabel = imovel.tipoVaga === 'coberta' ? 'Coberta' : imovel.tipoVaga === 'descoberta' ? 'Descoberta' : imovel.tipoVaga === 'ambos' ? 'Coberta e descoberta' : null;
  const siteConfig = await getSiteConfig({ cache: 'no-store' });
  const whatsapp = siteConfig?.whatsapp?.trim() || SITE_CONFIG.whatsapp;
  const whatsappLink = `https://wa.me/${whatsapp.replace(/\D/g, '')}`;

  return (
    <>
      <div className="container" style={{ paddingTop: 'var(--site-space-6)' }}>
        <p className="imovel-voltar">
          <Link href="/imoveis">← Voltar aos imóveis</Link>
        </p>
      </div>

      <div className="imovel-detalhe-galeria-wrap">
        <ImovelDetalheCapaCarousel fotos={fotos} />
      </div>

      <div className="container container-detalhe">
        <div className="imovel-detalhe-wrap">
          <div>
            <header className="imovel-detalhe-header">
              <h1 className="imovel-detalhe-tipo">{formatTipo(imovel.tipo)}</h1>
              {imovel.codigo && <span className="imovel-detalhe-codigo">Cód. {imovel.codigo}</span>}
              {(imovel.bairro || imovel.cidade) && (
                <p className="imovel-detalhe-local">
                  {[imovel.bairro, imovel.cidade].filter(Boolean).join(', ')}
                </p>
              )}
            </header>

            <div className="imovel-detalhe-body">
              <section>
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
                    <div className="imovel-detalhe-valor-item">
                      <span className="imovel-detalhe-valor-label">IPTU</span>
                      <span className="imovel-detalhe-valor-numero">{valorIptu}</span>
                    </div>
                  )}
                  {valorCondominio && (
                    <div className="imovel-detalhe-valor-item">
                      <span className="imovel-detalhe-valor-label">Condomínio</span>
                      <span className="imovel-detalhe-valor-numero">{valorCondominio}</span>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h2 className="imovel-detalhe-secao-titulo">Localização</h2>
                <p className="imovel-detalhe-endereco">{enderecoTexto}</p>
              </section>

              <section>
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
                <section>
                  <h2 className="imovel-detalhe-secao-titulo">Características</h2>
                  <ul className="imovel-detalhe-carac-lista">
                    {caracteristicas.map((c) => (
                      <li key={c}>{c.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </section>
              )}

              {(imovel.pontosReferencia || imovel.eletrodomesticos) && (
                <section>
                  <h2 className="imovel-detalhe-secao-titulo">Extras</h2>
                  {imovel.pontosReferencia && (
                    <p className="imovel-detalhe-endereco"><strong>Pontos de referência:</strong> {imovel.pontosReferencia}</p>
                  )}
                  {imovel.eletrodomesticos && (
                    <p className="imovel-detalhe-endereco"><strong>Eletrodomésticos:</strong> {imovel.eletrodomesticos}</p>
                  )}
                </section>
              )}

              {imovel.descricao && (
                <section>
                  <h2 className="imovel-detalhe-secao-titulo">Descrição</h2>
                  <div className="imovel-detalhe-descricao"><p>{imovel.descricao}</p></div>
                </section>
              )}

              <section className="imovel-detalhe-form" id="interesse">
                <h2 className="imovel-detalhe-secao-titulo">Tenho interesse</h2>
                <FormInteresse imovelId={imovel.id} />
              </section>
            </div>
          </div>

          <aside className="imovel-detalhe-sticky">
            <p className="imovel-detalhe-valor-principal">{valorPrincipal}</p>
            <a href="#interesse" className="btn btn-primary">
              Solicitar informações
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="imovel-detalhe-sticky-whatsapp"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Fale no WhatsApp
            </a>
          </aside>
        </div>
      </div>
    </>
  );
}
