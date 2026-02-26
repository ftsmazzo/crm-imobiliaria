import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getImovel, getImovelFotos, type ImovelFoto } from '../api';
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
  }, [id]);

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
            <Item label="Código" value={imovel.codigo} />
            <Item label="Quadra (interno)" value={imovel.quadra} />
            <Item label="Lote (interno)" value={imovel.lote} />
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
            <ul className="imovel-detalhe-fotos">
              {fotos.map((f) => (
                <li key={f.id}>
                  {f.url ? <img src={f.url} alt="" /> : <span className="imovel-detalhe-foto-placeholder" />}
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>
    </AppLayout>
  );
}
