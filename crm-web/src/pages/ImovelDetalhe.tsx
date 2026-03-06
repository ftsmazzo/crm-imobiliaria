import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImovel, getImovelFotos, getImovelDocumentos, uploadImovelDocumento, getImovelDocumentoUrl, deleteImovelDocumento, setImovelFotoCapa, type ImovelFoto, type ImovelDocumento } from '../api';
import type { Imovel } from '../types';
import AppLayout from '../components/AppLayout';
import './ImovelDetalhe.css';

const TIPO_LABELS: Record<string, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  casa_condominio: 'Casa em condomínio',
  terreno: 'Terreno',
  terreno_condominio: 'Terreno em condomínio',
  comercial: 'Comercial',
};

const STATUS_LABELS: Record<string, string> = {
  disponivel: 'Disponível',
  indisponivel: 'Indisponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  alugado: 'Alugado',
};

const TIPO_LISTING_LABELS: Record<string, string> = {
  residencial: 'Residencial',
  comercial: 'Comercial',
  rural: 'Rural',
  terreno: 'Terreno',
  outro: 'Outro',
};

function labelCaracteristica(key: string): string {
  return key.replace(/_/g, ' ');
}

function formatValor(v: number | string | null | undefined): string {
  if (v == null) return '–';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (Number.isNaN(n)) return '–';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="imovel-detalhe-block">
      <h2>{title}</h2>
      <div className="imovel-detalhe-block-content">{children}</div>
    </section>
  );
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '') return null;
  return (
    <div className="imovel-detalhe-item">
      <span className="imovel-detalhe-label">{label}</span>
      <span className="imovel-detalhe-value">{value}</span>
    </div>
  );
}

export default function ImovelDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [fotos, setFotos] = useState<ImovelFoto[]>([]);
  const [documentos, setDocumentos] = useState<ImovelDocumento[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!id || id === 'novo') return;
    setLoading(true);
    setErro('');
    getImovel(id)
      .then(setImovel)
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false));
    getImovelFotos(id).then(setFotos).catch(() => setFotos([]));
    getImovelDocumentos(id).then(setDocumentos).catch(() => setDocumentos([]));
  }, [id]);

  async function handleUploadDocumento(e: React.ChangeEvent<HTMLInputElement>, tipo: string) {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    e.target.value = '';
    setUploadingDoc(true);
    try {
      await uploadImovelDocumento(id, file, tipo);
      const list = await getImovelDocumentos(id);
      setDocumentos(list);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar documento');
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleVerDocumento(docId: string) {
    if (!id) return;
    try {
      const { url } = await getImovelDocumentoUrl(id, docId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao abrir documento');
    }
  }

  async function handleExcluirDocumento(docId: string) {
    if (!id || !confirm('Excluir este documento?')) return;
    try {
      await deleteImovelDocumento(id, docId);
      setDocumentos((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  if (!id || id === 'novo') {
    navigate('/imoveis', { replace: true });
    return null;
  }

  if (loading) {
    return <AppLayout><div className="imovel-detalhe-loading">Carregando...</div></AppLayout>;
  }

  if (erro || !imovel) {
    return (
      <AppLayout>
        <div className="imovel-detalhe-page">
          <p className="imovel-detalhe-erro">{erro || 'Imóvel não encontrado.'}</p>
          <button type="button" className="secondary" onClick={() => navigate('/imoveis')}>Voltar</button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="imovel-detalhe-page">
        <header className="imovel-detalhe-header">
          <div className="imovel-detalhe-header-top">
            <button type="button" className="imovel-detalhe-back" onClick={() => navigate('/imoveis')}>← Voltar</button>
            <button type="button" className="imovel-detalhe-edit" onClick={() => navigate(`/imoveis/${id}/editar`)}>Editar</button>
          </div>
          <h1>
            {imovel.codigo ? `Imóvel ${imovel.codigo}` : 'Detalhes do imóvel'}
            <span className="imovel-detalhe-tipo">{TIPO_LABELS[imovel.tipo] || imovel.tipo}</span>
          </h1>
          <span className={`imovel-detalhe-status ${imovel.status}`}>{STATUS_LABELS[imovel.status] || imovel.status}</span>
        </header>

        <div className="imovel-detalhe-grid">
          <Block title="Identificação">
            <Item label="Código Imóvel" value={imovel.codigo} />
            <Item label="Quadra" value={imovel.quadra} />
            <Item label="Lote" value={imovel.lote} />
            <Item label="Empreendimento" value={imovel.empreendimento?.nome} />
            <Item label="Nº Matrícula" value={imovel.numeroMatricula} />
            <Item label="Nº IPTU" value={imovel.numeroIptu} />
            <Item label="Cartório" value={imovel.cartorio} />
            <Item label="Tipo de listing" value={imovel.tipoListing ? TIPO_LISTING_LABELS[imovel.tipoListing] || imovel.tipoListing : null} />
            <Item label="Subtipo" value={imovel.subtipo} />
            <Item label="Exibir endereço no site?" value={imovel.exibirEnderecoSite === false ? 'Não' : imovel.exibirEnderecoSite === true ? 'Sim' : null} />
          </Block>

          <Block title="Endereço">
            <Item label="Logradouro" value={imovel.rua} />
            <Item label="Número" value={imovel.numero} />
            <Item label="Complemento" value={imovel.complemento} />
            <Item label="Bairro" value={imovel.bairro} />
            <Item label="Cidade" value={imovel.cidade} />
            <Item label="CEP" value={imovel.cep} />
          </Block>

          <Block title="Valores">
            <Item label="Valor venda" value={imovel.valorVenda != null ? formatValor(imovel.valorVenda) : null} />
            <Item label="Valor aluguel" value={imovel.valorAluguel != null ? formatValor(imovel.valorAluguel) : null} />
            <Item label="IPTU" value={imovel.valorIptu != null ? formatValor(imovel.valorIptu) : null} />
            <Item label="Condomínio" value={imovel.valorCondominio != null ? formatValor(imovel.valorCondominio) : null} />
          </Block>

          <Block title="Características">
            <Item label="Quartos" value={imovel.qtdQuartos != null ? String(imovel.qtdQuartos) : null} />
            <Item label="Banheiros" value={imovel.qtdBanheiros != null ? String(imovel.qtdBanheiros) : null} />
            <Item label="Salas" value={imovel.qtdSalas != null ? String(imovel.qtdSalas) : null} />
            <Item label="Lavabo" value={imovel.lavabo != null && imovel.lavabo > 0 ? String(imovel.lavabo) : null} />
            <Item label="Vagas" value={imovel.qtdVagas != null ? String(imovel.qtdVagas) : null} />
            <Item label="Tipo de vaga" value={imovel.tipoVaga} />
            <Item label="Área construída (m²)" value={imovel.area != null ? String(imovel.area) : null} />
            <Item label="Área terreno (m²)" value={imovel.areaTerreno != null ? String(imovel.areaTerreno) : null} />
            <Item label="Ano de construção" value={imovel.anoConstrucao != null ? String(imovel.anoConstrucao) : null} />
            <Item label="Tipo de piso" value={imovel.tipoPiso} />
            <Item label="Pontos de referência" value={imovel.pontosReferencia} />
            <Item label="Eletrodomésticos" value={imovel.eletrodomesticos} />
            <Item label="Andar da unidade" value={imovel.andarUnidade != null ? String(imovel.andarUnidade) : null} />
            <Item label="Nº andares" value={imovel.qtdAndares != null ? String(imovel.qtdAndares) : null} />
            <Item label="Total de unidades" value={imovel.totalUnidades != null ? String(imovel.totalUnidades) : null} />
            <Item label="Nº torres" value={imovel.qtdTorres != null ? String(imovel.qtdTorres) : null} />
            {imovel.caracteristicas && (() => {
              try {
                const arr = JSON.parse(imovel.caracteristicas) as string[];
                if (Array.isArray(arr) && arr.length > 0) {
                  return (
                    <div className="imovel-detalhe-item">
                      <span className="imovel-detalhe-label">Características</span>
                      <span className="imovel-detalhe-value">{arr.map(labelCaracteristica).join(', ')}</span>
                    </div>
                  );
                }
              } catch { /* ignore */ }
              return null;
            })()}
          </Block>

          {(imovel.proprietario || imovel.descricao) && (
            <>
              {imovel.proprietario && (
                <Block title="Proprietário">
                  <Item label="Nome" value={imovel.proprietario.nome} />
                  <Item label="Telefone" value={imovel.proprietario.telefone} />
                  <Item label="E-mail" value={imovel.proprietario.email} />
                </Block>
              )}
              {imovel.descricao && (
                <Block title="Descrição">
                  <p className="imovel-detalhe-descricao">{imovel.descricao}</p>
                </Block>
              )}
            </>
          )}
        </div>

        {fotos.length > 0 && (
          <Block title="Fotos">
            <p className="imovel-detalhe-fotos-hint">A primeira foto (ou a marcada como capa) é exibida no site. Use &quot;Definir como capa&quot; para escolher a foto de capa.</p>
            <ul className="imovel-detalhe-fotos">
              {fotos.map((f) => (
                <li key={f.id} className={f.capa ? 'imovel-detalhe-foto-capa' : ''}>
                  {f.url ? <img src={f.url} alt="" /> : <span className="imovel-detalhe-foto-placeholder" />}
                  {f.capa && <span className="imovel-detalhe-foto-capa-badge">Capa (site)</span>}
                  {!f.capa && (
                    <button
                      type="button"
                      className="imovel-detalhe-foto-btn-capa"
                      onClick={async () => {
                        if (!id) return;
                        try {
                          const list = await setImovelFotoCapa(id, f.id);
                          setFotos(list);
                        } catch (err) {
                          setErro(err instanceof Error ? err.message : 'Erro ao definir capa');
                        }
                      }}
                    >
                      Definir como capa
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Block>
        )}

        <Block title="Documentos (PDF)">
          <p className="imovel-detalhe-docs-hint">IPTU, autorização e outros documentos do imóvel. Clique em &quot;Ver&quot; para visualizar o PDF.</p>
          <div className="imovel-detalhe-docs-upload">
            <select id="doc-tipo" defaultValue="outro" className="imovel-detalhe-doc-tipo">
              <option value="iptu">IPTU</option>
              <option value="autorizacao">Autorização</option>
              <option value="outro">Outro</option>
            </select>
            <label className="imovel-detalhe-docs-upload-btn">
              <input
                type="file"
                accept=".pdf,application/pdf"
                disabled={uploadingDoc}
                onChange={(e) => {
                  const tipo = (document.getElementById('doc-tipo') as HTMLSelectElement)?.value || 'outro';
                  handleUploadDocumento(e, tipo);
                }}
                style={{ display: 'none' }}
              />
              {uploadingDoc ? 'Enviando...' : 'Enviar PDF'}
            </label>
          </div>
          {documentos.length > 0 ? (
            <ul className="imovel-detalhe-docs-list">
              {documentos.map((d) => (
                <li key={d.id}>
                  <span className="imovel-detalhe-doc-nome">{d.nome || d.tipo}</span>
                  <span className="imovel-detalhe-doc-tipo-badge">{d.tipo}</span>
                  <button type="button" className="imovel-detalhe-doc-ver" onClick={() => handleVerDocumento(d.id)}>Ver</button>
                  <button type="button" className="imovel-detalhe-doc-excluir" onClick={() => handleExcluirDocumento(d.id)}>Excluir</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="imovel-detalhe-docs-vazio">Nenhum documento. Envie um PDF acima.</p>
          )}
        </Block>
      </div>
    </AppLayout>
  );
}
