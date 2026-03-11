import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImoveis, createImovel, deleteImovel, updateImovel, getUsuarios, confirmarDisponibilidadeImovel, simularDiasSemVerificacao } from '../api';
import type { Imovel } from '../types';
import type { UsuarioListItem } from '../api';
import { getUser } from '../auth';
import {
  parseCsvImoveis,
  gerarModeloCsv,
  rowToPayload,
  type ResultadoParse,
} from '../csv-imoveis';
import AppLayout from '../components/AppLayout';
import './Imoveis.css';

function formatValor(v: number | string | null | undefined): string {
  if (v == null) return '';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (Number.isNaN(n)) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

const STATUS_LABEL: Record<string, string> = {
  disponivel: 'Disponível',
  indisponivel: 'Indisponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  alugado: 'Alugado',
};

export default function Imoveis() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ResultadoParse | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, ok: 0, errors: 0 });
  const [togglingDestaque, setTogglingDestaque] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const [filtros, setFiltros] = useState<{
    busca?: string;
    statusSemaforo?: 'verde' | 'amarelo' | 'vermelho';
    usuarioResponsavelId?: string;
    valorVendaMin?: number;
    valorVendaMax?: number;
    qtdQuartosMin?: number;
    areaMin?: number;
  }>({});
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [simulandoId, setSimulandoId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>(() => {
    try {
      const v = localStorage.getItem('imoveis-view');
      return (v === 'list' || v === 'cards') ? v : 'cards';
    } catch {
      return 'cards';
    }
  });

  const user = getUser();
  const isGestor = user?.role === 'gestor';

  useEffect(() => {
    if (viewMode) localStorage.setItem('imoveis-view', viewMode);
  }, [viewMode]);

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getImoveis({
        ...(filtros.busca && { busca: filtros.busca }),
        ...(filtros.statusSemaforo && { statusSemaforo: filtros.statusSemaforo }),
        ...(filtros.usuarioResponsavelId && { usuarioResponsavelId: filtros.usuarioResponsavelId }),
        ...(filtros.valorVendaMin != null && { valorVendaMin: filtros.valorVendaMin }),
        ...(filtros.valorVendaMax != null && { valorVendaMax: filtros.valorVendaMax }),
        ...(filtros.qtdQuartosMin != null && { qtdQuartosMin: filtros.qtdQuartosMin }),
        ...(filtros.areaMin != null && { areaMin: filtros.areaMin }),
      });
      setLista(data);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isGestor) getUsuarios().then(setUsuarios).catch(() => setUsuarios([]));
  }, [isGestor]);

  async function toggleDestaque(imovel: Imovel) {
    setTogglingDestaque(imovel.id);
    try {
      await updateImovel(imovel.id, { destaque: !imovel.destaque });
      setLista((prev) =>
        prev.map((x) => (x.id === imovel.id ? { ...x, destaque: !x.destaque } : x)),
      );
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao atualizar destaque');
    } finally {
      setTogglingDestaque(null);
    }
  }

  useEffect(() => {
    load();
  }, [filtros.busca, filtros.statusSemaforo, filtros.usuarioResponsavelId, filtros.valorVendaMin, filtros.valorVendaMax, filtros.qtdQuartosMin, filtros.areaMin]);

  // Atualizar lista ao voltar para a aba (ex.: depois de confirmar no Zap e checar pendentes na Admin)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  async function handleConfirmarDisponibilidade(i: Imovel) {
    setConfirmandoId(i.id);
    setErro('');
    try {
      const atualizado = await confirmarDisponibilidadeImovel(i.id);
      setLista((prev) => prev.map((x) => (x.id === i.id ? atualizado : x)));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao confirmar disponibilidade');
    } finally {
      setConfirmandoId(null);
    }
  }

  /** Simula X dias sem verificação (teste de cores do semáforo). Apenas gestor. */
  async function handleSimularDias(i: Imovel, dias: number) {
    setSimulandoId(i.id);
    setErro('');
    try {
      await simularDiasSemVerificacao(i.id, dias);
      await load();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao simular dias');
    } finally {
      setSimulandoId(null);
    }
  }

  async function handleDelete(i: Imovel) {
    if (!confirm(`Excluir imóvel ${i.codigo || i.id}?`)) return;
    try {
      await deleteImovel(i.id);
      load();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao excluir');
    }
  }

  function downloadModeloCsv() {
    const csv = gerarModeloCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modelo-imoveis.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function openImportModal() {
    setImportModalOpen(true);
    setImportFile(null);
    setImportResult(null);
    setImportProgress({ current: 0, total: 0, ok: 0, errors: 0 });
  }

  function closeImportModal() {
    if (!importing) {
      setImportModalOpen(false);
      setImportFile(null);
      setImportResult(null);
    }
  }

  function handleImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const result = parseCsvImoveis(text);
        setImportResult(result);
      } catch {
        setImportResult({ rows: [], headers: [], mapaColunas: {}, errosLinha: [{ linha: 1, mensagem: 'Erro ao ler o CSV' }] });
      }
    };
    reader.readAsText(file, 'UTF-8');
  }

  async function runImport() {
    if (!importResult?.rows.length) return;
    setImporting(true);
    setErro('');
    let ok = 0;
    let errors = 0;
    const total = importResult.rows.length;
    for (let i = 0; i < total; i++) {
      setImportProgress({ current: i + 1, total, ok, errors });
      try {
        const payload = rowToPayload(importResult.rows[i]);
        await createImovel(payload as Partial<Imovel>);
        ok++;
      } catch {
        errors++;
      }
    }
    setImportProgress({ current: total, total, ok, errors });
    setImporting(false);
    load();
    setImportFile(null);
    setImportResult(null);
    setImportModalOpen(false);
  }

  if (loading) return <AppLayout><div className="imoveis-loading">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="imoveis-page">
        <h1>Imóveis</h1>
        <p className="lead">Cadastre e gerencie imóveis para venda e locação.</p>
        {erro && <p className="imoveis-erro">{erro}</p>}
        <div className="imoveis-filtros">
          <input
            type="text"
            className="imoveis-filtro-busca"
            placeholder="Buscar (código, bairro, cidade, condomínio)"
            value={filtros.busca ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, busca: e.target.value || undefined }))}
          />
          <select
            className="imoveis-filtro-select"
            value={filtros.statusSemaforo ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, statusSemaforo: (e.target.value as 'verde' | 'amarelo' | 'vermelho') || undefined }))}
          >
            <option value="">Semáforo: todos</option>
            <option value="verde">Verde (&lt; 15 dias)</option>
            <option value="amarelo">Amarelo (15–30 dias)</option>
            <option value="vermelho">Vermelho (&gt; 30 dias)</option>
          </select>
          {isGestor && (
            <select
              className="imoveis-filtro-select"
              value={filtros.usuarioResponsavelId ?? ''}
              onChange={(e) => setFiltros((f) => ({ ...f, usuarioResponsavelId: e.target.value || undefined }))}
            >
              <option value="">Todos os responsáveis</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          )}
          <input
            type="number"
            className="imoveis-filtro-num"
            placeholder="Valor venda min"
            value={filtros.valorVendaMin ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, valorVendaMin: e.target.value ? Number(e.target.value) : undefined }))}
          />
          <input
            type="number"
            className="imoveis-filtro-num"
            placeholder="Valor venda max"
            value={filtros.valorVendaMax ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, valorVendaMax: e.target.value ? Number(e.target.value) : undefined }))}
          />
          <input
            type="number"
            className="imoveis-filtro-num"
            placeholder="Quartos mín"
            min={0}
            value={filtros.qtdQuartosMin ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, qtdQuartosMin: e.target.value ? Number(e.target.value) : undefined }))}
          />
          <input
            type="number"
            className="imoveis-filtro-num"
            placeholder="Área mín (m²)"
            min={0}
            value={filtros.areaMin ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, areaMin: e.target.value ? Number(e.target.value) : undefined }))}
          />
        </div>
        <div className="imoveis-toolbar">
          <div className="imoveis-toolbar-left">
            <button type="button" className="imoveis-btn-import" onClick={openImportModal}>
              Importar CSV
            </button>
            <button type="button" className="imoveis-btn-refresh" onClick={() => load()} title="Atualizar lista (útil após confirmar pelo Zap)">
              Atualizar
            </button>
            {isGestor && (
              <button
                type="button"
                className="imoveis-btn-testar-notif"
                onClick={() => navigate('/administracao')}
                title="Ver pendentes, preview da mensagem e disparar notificação amarelo"
              >
                Testar notificação amarelo
              </button>
            )}
            <div className="imoveis-view-toggle" role="group" aria-label="Tipo de visualização">
              <button
                type="button"
                className={`imoveis-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Visualização em cards"
              >
                Cards
              </button>
              <button
                type="button"
                className={`imoveis-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="Visualização em lista"
              >
                Lista
              </button>
            </div>
          </div>
          <button type="button" className="imoveis-btn-new" onClick={() => navigate('/imoveis/novo')}>
            + Novo imóvel
          </button>
        </div>

        {lista.length === 0 ? (
          <div className="imoveis-empty">
            <p>Nenhum imóvel cadastrado ainda.</p>
            <button type="button" className="imoveis-btn-new" onClick={() => navigate('/imoveis/novo')}>
              + Cadastrar primeiro imóvel
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div className="imoveis-list-wrap">
            <table className="imoveis-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Endereço</th>
                  <th>Semáforo</th>
                  <th>Status</th>
                  <th>Valores</th>
                  {isGestor && <th>Responsável</th>}
                  <th className="imoveis-table-actions">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((i) => (
                  <tr key={i.id} className="imoveis-table-row">
                    <td><span className="imoveis-table-codigo">{i.codigo || '–'}</span></td>
                    <td>{i.tipo || '–'}</td>
                    <td>{[i.rua, i.numero, i.bairro, i.cidade].filter(Boolean).join(', ') || '–'}</td>
                    <td>
                      {i.statusSemaforo ? (
                        <span className={`imovel-card-semaforo ${i.statusSemaforo}`} title={i.diasDesdeVerificacao != null ? `${i.diasDesdeVerificacao} dias` : ''}>
                          {i.statusSemaforo === 'verde' && '● Verde'}
                          {i.statusSemaforo === 'amarelo' && '● Amarelo'}
                          {i.statusSemaforo === 'vermelho' && '● Vermelho'}
                        </span>
                      ) : '–'}
                    </td>
                    <td><span className={`imovel-card-status ${i.status}`}>{STATUS_LABEL[i.status] ?? i.status}</span></td>
                    <td>
                      {i.valorVenda != null && formatValor(i.valorVenda)}
                      {i.valorVenda != null && i.valorAluguel != null && ' / '}
                      {i.valorAluguel != null && formatValor(i.valorAluguel)}
                      {i.valorVenda == null && i.valorAluguel == null && '–'}
                    </td>
                    {isGestor && <td>{i.usuarioResponsavel?.nome ?? '–'}</td>}
                    <td className="imoveis-table-actions">
                      <div className="imoveis-table-action-btns">
                        {(i.statusSemaforo === 'amarelo' || i.statusSemaforo === 'vermelho') && (
                          <button type="button" className="btn-success imoveis-table-btn" onClick={() => handleConfirmarDisponibilidade(i)} disabled={confirmandoId === i.id}>
                            {confirmandoId === i.id ? '...' : 'Confirmar'}
                          </button>
                        )}
                        {isGestor && (
                          <>
                            <button type="button" className="imoveis-table-btn imoveis-table-btn-sim" onClick={() => handleSimularDias(i, 20)} disabled={simulandoId === i.id} title="Simular 20d (amarelo)">{simulandoId === i.id ? '...' : '20d'}</button>
                            <button type="button" className="imoveis-table-btn imoveis-table-btn-sim" onClick={() => handleSimularDias(i, 35)} disabled={simulandoId === i.id} title="Simular 35d (vermelho)">35d</button>
                          </>
                        )}
                        <button type="button" className="btn-secondary imoveis-table-btn" onClick={() => navigate(`/imoveis/${i.id}`)}>Ver</button>
                        <button type="button" className="btn-secondary imoveis-table-btn" onClick={() => navigate(`/imoveis/${i.id}/editar`)}>Editar</button>
                        <button type="button" className="btn-danger imoveis-table-btn" onClick={() => handleDelete(i)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="imoveis-grid">
            {lista.map((i) => (
              <div key={i.id} className="imovel-card">
                <div className="imovel-card-header">
                  <span className="imovel-card-tipo">{i.tipo}</span>
                  {i.statusSemaforo && (
                    <span className={`imovel-card-semaforo ${i.statusSemaforo}`} title={i.diasDesdeVerificacao != null ? `${i.diasDesdeVerificacao} dias desde última verificação` : ''}>
                      {i.statusSemaforo === 'verde' && '● Verde'}
                      {i.statusSemaforo === 'amarelo' && '● Amarelo'}
                      {i.statusSemaforo === 'vermelho' && '● Vermelho'}
                    </span>
                  )}
                  <span className={`imovel-card-status ${i.status}`}>{STATUS_LABEL[i.status] ?? i.status}</span>
                  <button
                    type="button"
                    className={`imovel-card-destaque ${i.destaque ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleDestaque(i); }}
                    disabled={togglingDestaque === i.id}
                    title={i.destaque ? 'Remover do destaque (página inicial)' : 'Colocar em destaque (página inicial)'}
                    style={{ display: isGestor ? undefined : 'none' }}
                  >
                    {i.destaque ? '★ Destaque' : '☆ Destaque'}
                  </button>
                </div>
                <div className="imovel-card-endereco">
                  {[i.rua, i.numero, i.bairro, i.cidade].filter(Boolean).join(', ') || i.codigo || 'Sem endereço'}
                </div>
                <div className="imovel-card-valores">
                  {i.valorVenda != null && <span>Venda {formatValor(i.valorVenda)}</span>}
                  {i.valorAluguel != null && <span>Aluguel {formatValor(i.valorAluguel)}</span>}
                  {i.valorVenda == null && i.valorAluguel == null && '–'}
                </div>
                {isGestor && (
                  <div className="imovel-card-teste-semaforo">
                    <span className="imovel-card-teste-label">Teste semáforo:</span>
                    <button
                      type="button"
                      className="imovel-card-btn-simular"
                      onClick={(e) => { e.stopPropagation(); handleSimularDias(i, 20); }}
                      disabled={simulandoId === i.id}
                      title="Simular 20 dias sem verificação (amarelo)"
                    >
                      {simulandoId === i.id ? '...' : '20d'}
                    </button>
                    <button
                      type="button"
                      className="imovel-card-btn-simular"
                      onClick={(e) => { e.stopPropagation(); handleSimularDias(i, 35); }}
                      disabled={simulandoId === i.id}
                      title="Simular 35 dias sem verificação (vermelho)"
                    >
                      35d
                    </button>
                  </div>
                )}
                <div className="imovel-card-actions">
                  {(i.statusSemaforo === 'amarelo' || i.statusSemaforo === 'vermelho') && (
                    <button
                      type="button"
                      className="imovel-card-btn-confirmar btn-success"
                      onClick={() => handleConfirmarDisponibilidade(i)}
                      disabled={confirmandoId === i.id}
                      title="Confirmar que o imóvel ainda está disponível (reinicia a contagem)"
                    >
                      {confirmandoId === i.id ? '...' : 'Confirmar disponível'}
                    </button>
                  )}
                  <button type="button" className="btn-secondary" onClick={() => navigate(`/imoveis/${i.id}`)}>Ver</button>
                  <button type="button" className="btn-secondary" onClick={() => navigate(`/imoveis/${i.id}/editar`)}>Editar</button>
                  <button type="button" className="btn-danger" onClick={() => handleDelete(i)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {importModalOpen && (
        <div className="imoveis-modal-overlay" onClick={closeImportModal}>
          <div className="imoveis-import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="imoveis-import-header">
              <h2>Importar imóveis (CSV)</h2>
              <button type="button" className="imoveis-import-close" onClick={closeImportModal} aria-label="Fechar">
                ×
              </button>
            </div>
            <div className="imoveis-import-body">
              <p className="imoveis-import-lead">
                Use um CSV com as colunas do modelo ou nomes parecidos (rua, logradouro, bairro, cidade, CEP, etc.). O sistema reconhece as colunas automaticamente.
              </p>
              <div className="imoveis-import-actions-top">
                <button type="button" className="imoveis-btn-modelo" onClick={downloadModeloCsv}>
                  Baixar modelo CSV
                </button>
                <label className="imoveis-btn-escolher">
                  <input type="file" accept=".csv,text/csv" onChange={handleImportFileChange} style={{ display: 'none' }} />
                  {importFile ? importFile.name : 'Escolher arquivo CSV'}
                </label>
              </div>

              {importResult && (
                <>
                  {importResult.errosLinha.length > 0 && (
                    <div className="imoveis-import-erros">
                      <strong>Avisos:</strong>
                      <ul>
                        {importResult.errosLinha.slice(0, 5).map((e, i) => (
                          <li key={i}>Linha {e.linha}: {e.mensagem}</li>
                        ))}
                        {importResult.errosLinha.length > 5 && (
                          <li>… e mais {importResult.errosLinha.length - 5} aviso(s)</li>
                        )}
                      </ul>
                    </div>
                  )}
                  <p className="imoveis-import-preview-title">
                    {importResult.rows.length} imóvel(is) detectado(s). Prévia (até 5 linhas):
                  </p>
                  <div className="imoveis-import-table-wrap">
                    <table className="imoveis-import-table">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Endereço</th>
                          <th>Valores</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.rows.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            <td>{row.tipo ?? '–'}</td>
                            <td>{[row.rua, row.numero, row.bairro, row.cidade].filter(Boolean).join(', ') || '–'}</td>
                            <td>
                              {row.valorVenda != null && `Venda ${formatValor(row.valorVenda)} `}
                              {row.valorAluguel != null && `Aluguel ${formatValor(row.valorAluguel)}`}
                              {row.valorVenda == null && row.valorAluguel == null && '–'}
                            </td>
                            <td>{row.status ?? '–'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!importing ? (
                    <div className="imoveis-import-actions-bottom">
                      <button type="button" className="btn-secondary" onClick={closeImportModal}>
                        Cancelar
                      </button>
                      <button type="button" className="btn-success" onClick={runImport}>
                        Importar {importResult.rows.length} imóvel(is)
                      </button>
                    </div>
                  ) : (
                    <div className="imoveis-import-progress">
                      <p>Importando… {importProgress.current} / {importProgress.total}</p>
                      <p className="imoveis-import-result-mini">
                        {importProgress.ok} ok, {importProgress.errors} erro(s)
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
