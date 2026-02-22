import { useEffect, useState } from 'react';
import { getImoveis, createImovel, updateImovel, deleteImovel, getImovelFotos, uploadImovelFoto, deleteImovelFoto, type ImovelFoto } from '../api';
import type { Imovel } from '../types';
import { buscarPorCep } from '../viacep';
import {
  parseCsvImoveis,
  gerarModeloCsv,
  rowToPayload,
  type ResultadoParse,
} from '../csv-imoveis';
import AppLayout from '../components/AppLayout';
import './Imoveis.css';

const TIPOS = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'comercial', label: 'Comercial' },
] as const;

const emptyForm = (): Record<string, string | number | undefined> => ({
  tipo: 'apartamento',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  cep: '',
  valorVenda: undefined,
  valorAluguel: undefined,
  status: 'disponivel',
  codigo: '',
  descricao: '',
  qtdQuartos: undefined,
  qtdBanheiros: undefined,
  area: undefined,
});

function formatValor(v: number | string | null | undefined): string {
  if (v == null) return '';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (Number.isNaN(n)) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function Imoveis() {
  const [lista, setLista] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState<'novo' | Imovel | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMsg, setCepMsg] = useState<'ok' | 'not_found' | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ResultadoParse | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, ok: 0, errors: 0 });
  const [fotos, setFotos] = useState<ImovelFoto[]>([]);
  const [fotosLoading, setFotosLoading] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

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

  function openNew() {
    setForm(emptyForm());
    setCepMsg(null);
    setModal('novo');
  }

  function openEdit(i: Imovel) {
    setForm({
      tipo: i.tipo,
      rua: i.rua ?? '',
      numero: i.numero ?? '',
      bairro: i.bairro ?? '',
      cidade: i.cidade ?? '',
      cep: i.cep ?? '',
      valorVenda: i.valorVenda != null ? Number(i.valorVenda) : undefined,
      valorAluguel: i.valorAluguel != null ? Number(i.valorAluguel) : undefined,
      status: i.status,
      codigo: i.codigo ?? '',
      descricao: i.descricao ?? '',
      qtdQuartos: i.qtdQuartos ?? undefined,
      qtdBanheiros: i.qtdBanheiros ?? undefined,
      area: i.area != null ? Number(i.area) : undefined,
    });
    setCepMsg(null);
    setModal(i);
    setFotos([]);
    if (i.id) {
      setFotosLoading(true);
      getImovelFotos(i.id).then(setFotos).catch(() => setFotos([])).finally(() => setFotosLoading(false));
    }
  }

  async function handleCepBlur() {
    const cep = String(form.cep ?? '').trim();
    if (cep.replace(/\D/g, '').length !== 8) {
      setCepMsg(null);
      return;
    }
    setCepLoading(true);
    setCepMsg(null);
    try {
      const endereco = await buscarPorCep(cep);
      if (endereco) {
        setForm((f) => ({
          ...f,
          cep: endereco.cep,
          rua: endereco.rua || f.rua,
          bairro: endereco.bairro || f.bairro,
          cidade: endereco.cidade || f.cidade,
        }));
        setCepMsg('ok');
      } else {
        setCepMsg('not_found');
      }
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErro('');
    try {
      const payload: Partial<Imovel> = {
        tipo: String(form.tipo),
        rua: form.rua != null ? String(form.rua) : undefined,
        numero: form.numero != null ? String(form.numero) : undefined,
        bairro: form.bairro != null ? String(form.bairro) : undefined,
        cidade: form.cidade != null ? String(form.cidade) : undefined,
        cep: form.cep != null ? String(form.cep) : undefined,
        valorVenda: form.valorVenda != null ? Number(form.valorVenda) : undefined,
        valorAluguel: form.valorAluguel != null ? Number(form.valorAluguel) : undefined,
        status: String(form.status),
        codigo: form.codigo != null ? String(form.codigo) : undefined,
        descricao: form.descricao != null ? String(form.descricao) : undefined,
        qtdQuartos: form.qtdQuartos != null ? Number(form.qtdQuartos) : undefined,
        qtdBanheiros: form.qtdBanheiros != null ? Number(form.qtdBanheiros) : undefined,
        area: form.area != null ? Number(form.area) : undefined,
      };
      if (modal === 'novo') {
        const created = await createImovel(payload);
        setModal(created);
        setForm(imovelToForm(created));
        setFotos([]);
        getImovelFotos(created.id).then(setFotos).catch(() => setFotos([]));
        load();
      } else if (modal) {
        await updateImovel(modal.id, payload);
        setModal(null);
        load();
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
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
        <div className="imoveis-toolbar">
          <button type="button" className="imoveis-btn-import" onClick={openImportModal}>
            Importar CSV
          </button>
          <button type="button" className="imoveis-btn-new" onClick={openNew}>
            + Novo imóvel
          </button>
        </div>

        {lista.length === 0 ? (
          <div className="imoveis-empty">
            <p>Nenhum imóvel cadastrado ainda.</p>
            <button type="button" className="imoveis-btn-new" onClick={openNew}>
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
                  <button type="button" onClick={() => openEdit(i)}>Editar</button>
                  <button type="button" onClick={() => handleDelete(i)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="imoveis-modal-overlay" onClick={() => setModal(null)}>
          <div className="imoveis-modal" onClick={(e) => e.stopPropagation()}>
            <div className="imoveis-modal-header">
              <h2>{modal === 'novo' ? 'Novo imóvel' : 'Editar imóvel'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="imoveis-form">
              <div className="imoveis-modal-body">
                {/* Identificação */}
                <section className="imoveis-form-section">
                  <h3 className="imoveis-form-section-title">Identificação</h3>
                  <div className="field">
                    <label>Tipo do imóvel</label>
                    <div className="imoveis-tipo-options">
                      {TIPOS.map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          className={form.tipo === t.value ? 'active' : ''}
                          onClick={() => setForm((f) => ({ ...f, tipo: t.value }))}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="field" style={{ marginTop: 'var(--crm-space-4)' }}>
                    <label htmlFor="imovel-codigo">Código (opcional)</label>
                    <input
                      id="imovel-codigo"
                      value={form.codigo}
                      onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                      placeholder="Ex: APT-101"
                    />
                  </div>
                </section>

                {/* Endereço */}
                <section className="imoveis-form-section">
                  <h3 className="imoveis-form-section-title">Endereço</h3>
                  <div className="field imoveis-cep-field">
                    <label htmlFor="imovel-cep">CEP</label>
                    <input
                      id="imovel-cep"
                      value={form.cep}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, cep: e.target.value }));
                        setCepMsg(null);
                      }}
                      onBlur={handleCepBlur}
                      placeholder="00000-000"
                      disabled={cepLoading}
                      aria-busy={cepLoading}
                    />
                    {cepLoading && <span className="imoveis-cep-hint loading">Buscando endereço...</span>}
                    {cepMsg === 'ok' && !cepLoading && <span className="imoveis-cep-hint ok">Endereço preenchido automaticamente</span>}
                    {cepMsg === 'not_found' && !cepLoading && <span className="imoveis-cep-hint not-found">CEP não encontrado. Preencha manualmente.</span>}
                    {!cepLoading && !cepMsg && <span className="imoveis-cep-hint">Digite o CEP e saia do campo para buscar</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="imovel-rua">Rua / Logradouro</label>
                    <input
                      id="imovel-rua"
                      value={form.rua}
                      onChange={(e) => setForm((f) => ({ ...f, rua: e.target.value }))}
                      placeholder="Nome da rua ou avenida"
                    />
                  </div>
                  <div className="imoveis-form-row">
                    <div className="field">
                      <label htmlFor="imovel-numero">Número</label>
                      <input
                        id="imovel-numero"
                        value={form.numero}
                        onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                        placeholder="Nº"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="imovel-bairro">Bairro</label>
                      <input
                        id="imovel-bairro"
                        value={form.bairro}
                        onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))}
                        placeholder="Bairro"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="imovel-cidade">Cidade</label>
                    <input
                      id="imovel-cidade"
                      value={form.cidade}
                      onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                      placeholder="Cidade"
                    />
                  </div>
                </section>

                {/* Valores e status */}
                <section className="imoveis-form-section">
                  <h3 className="imoveis-form-section-title">Valores e status</h3>
                  <div className="imoveis-form-row">
                    <div className="field">
                      <label htmlFor="imovel-venda">Valor venda (R$)</label>
                      <input
                        id="imovel-venda"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.valorVenda ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, valorVenda: e.target.value ? Number(e.target.value) : undefined }))}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="imovel-aluguel">Valor aluguel (R$)</label>
                      <input
                        id="imovel-aluguel"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.valorAluguel ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, valorAluguel: e.target.value ? Number(e.target.value) : undefined }))}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="imovel-status">Status</label>
                    <select
                      id="imovel-status"
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      <option value="disponivel">Disponível</option>
                      <option value="reservado">Reservado</option>
                      <option value="vendido">Vendido</option>
                      <option value="alugado">Alugado</option>
                    </select>
                  </div>
                </section>

                {/* Características */}
                <section className="imoveis-form-section">
                  <h3 className="imoveis-form-section-title">Características</h3>
                  <div className="imoveis-form-row imoveis-form-row-3">
                    <div className="field">
                      <label htmlFor="imovel-quartos">Quartos</label>
                      <input
                        id="imovel-quartos"
                        type="number"
                        min="0"
                        value={form.qtdQuartos ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, qtdQuartos: e.target.value ? Number(e.target.value) : undefined }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="imovel-banheiros">Banheiros</label>
                      <input
                        id="imovel-banheiros"
                        type="number"
                        min="0"
                        value={form.qtdBanheiros ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, qtdBanheiros: e.target.value ? Number(e.target.value) : undefined }))}
                        placeholder="0"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="imovel-area">Área (m²)</label>
                      <input
                        id="imovel-area"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.area ?? ''}
                        onChange={(e) => setForm((f) => ({ ...f, area: e.target.value ? Number(e.target.value) : undefined }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </section>

                {/* Descrição */}
                <section className="imoveis-form-section">
                  <h3 className="imoveis-form-section-title">Descrição</h3>
                  <div className="field">
                    <label htmlFor="imovel-descricao">Observações ou descrição</label>
                    <textarea
                      id="imovel-descricao"
                      value={form.descricao}
                      onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                      placeholder="Detalhes do imóvel, pontos de interesse, etc."
                    />
                  </div>
                </section>

                {/* Fotos (só ao editar ou após criar) */}
                {modal && typeof modal === 'object' && modal.id && (
                  <section className="imoveis-form-section">
                    <h3 className="imoveis-form-section-title">Fotos do imóvel</h3>
                    <div className="field">
                      <label>Enviar foto (até 10 MB)</label>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingFoto}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !modal || typeof modal !== 'object' || !modal.id) return;
                          setUploadingFoto(true);
                          try {
                            await uploadImovelFoto(modal.id, file);
                            const list = await getImovelFotos(modal.id);
                            setFotos(list);
                          } catch (err) {
                            console.error(err);
                            alert('Falha ao enviar foto. Tente de novo.');
                          } finally {
                            setUploadingFoto(false);
                            e.target.value = '';
                          }
                        }}
                      />
                      {uploadingFoto && <span className="imoveis-foto-status">Enviando...</span>}
                    </div>
                    {fotosLoading ? (
                      <p className="imoveis-fotos-loading">Carregando fotos...</p>
                    ) : fotos.length > 0 ? (
                      <ul className="imoveis-fotos-list">
                        {fotos.map((f) => (
                          <li key={f.id} className="imoveis-foto-item">
                            <img src={f.url} alt="" className="imoveis-foto-thumb" />
                            <button
                              type="button"
                              className="imoveis-foto-remove"
                              onClick={async () => {
                                if (!modal || typeof modal !== 'object' || !modal.id) return;
                                if (!confirm('Remover esta foto?')) return;
                                try {
                                  await deleteImovelFoto(modal.id, f.id);
                                  setFotos((prev) => prev.filter((x) => x.id !== f.id));
                                } catch (err) {
                                  console.error(err);
                                  alert('Falha ao remover foto.');
                                }
                              }}
                            >
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="imoveis-fotos-empty">Nenhuma foto ainda. Envie acima.</p>
                    )}
                  </section>
                )}
              </div>
              <div className="imoveis-form-actions">
                <button type="button" className="secondary" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar imóvel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
