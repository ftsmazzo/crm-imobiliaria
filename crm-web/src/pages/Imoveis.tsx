import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImoveis, createImovel, deleteImovel } from '../api';
import type { Imovel } from '../types';
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

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getImoveis();
      setLista(data);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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
        <div className="imoveis-toolbar">
          <button type="button" className="imoveis-btn-import" onClick={openImportModal}>
            Importar CSV
          </button>
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
        ) : (
          <div className="imoveis-grid">
            {lista.map((i) => (
              <div key={i.id} className="imovel-card">
                <div className="imovel-card-header">
                  <span className="imovel-card-tipo">{i.tipo}</span>
                  <span className={`imovel-card-status ${i.status}`}>{i.status}</span>
                </div>
                <div className="imovel-card-endereco">
                  {[i.rua, i.numero, i.bairro, i.cidade].filter(Boolean).join(', ') || i.codigo || 'Sem endereço'}
                </div>
                <div className="imovel-card-valores">
                  {i.valorVenda != null && <span>Venda {formatValor(i.valorVenda)}</span>}
                  {i.valorAluguel != null && <span>Aluguel {formatValor(i.valorAluguel)}</span>}
                  {i.valorVenda == null && i.valorAluguel == null && '–'}
                </div>
                <div className="imovel-card-actions">
                  <button type="button" onClick={() => navigate(`/imoveis/${i.id}/editar`)}>Editar</button>
                  <button type="button" onClick={() => handleDelete(i)}>Excluir</button>
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
                      <button type="button" className="secondary" onClick={closeImportModal}>
                        Cancelar
                      </button>
                      <button type="button" className="primary" onClick={runImport}>
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
