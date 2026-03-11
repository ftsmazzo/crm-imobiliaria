import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContatos, createContato, updateContato, deleteContato } from '../api';
import type { Contato } from '../types';
import { ESTAGIOS, ESTAGIO_LABEL } from '../types';
import AppLayout from '../components/AppLayout';
import LeadDetailModal from '../components/LeadDetailModal';
import './Contatos.css';

const emptyForm = () => ({
  nome: '',
  email: '',
  telefone: '',
  origem: '',
  observacoes: '',
  estagio: 'novo',
  valorDisponivel: '',
});

export default function Contatos() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState<'novo' | Contato | null>(null);
  const [detailContato, setDetailContato] = useState<Contato | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [filtroEstagio, setFiltroEstagio] = useState('');

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getContatos(filtroEstagio || undefined);
      setLista(data);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filtroEstagio]);

  function openNew() {
    setForm(emptyForm());
    setModal('novo');
  }

  function openEdit(c: Contato) {
    const v = c.valorDisponivel != null ? Number(c.valorDisponivel) : undefined;
    setForm({
      nome: c.nome,
      email: c.email,
      telefone: c.telefone ?? '',
      origem: c.origem ?? '',
      observacoes: c.observacoes ?? '',
      estagio: c.estagio,
      valorDisponivel: v !== undefined && !Number.isNaN(v) ? String(v) : '',
    });
    setModal(c);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErro('');
    try {
      const valorNum = form.valorDisponivel ? parseFloat(form.valorDisponivel) : undefined;
      const valorDisponivel = valorNum !== undefined && !Number.isNaN(valorNum) ? valorNum : undefined;
      if (modal === 'novo') {
        await createContato({
          nome: form.nome,
          email: form.email,
          telefone: form.telefone || undefined,
          origem: form.origem || undefined,
          observacoes: form.observacoes || undefined,
          estagio: form.estagio,
          valorDisponivel,
        });
      } else if (modal) {
        await updateContato(modal.id, {
          nome: form.nome,
          email: form.email,
          telefone: form.telefone || undefined,
          origem: form.origem || undefined,
          observacoes: form.observacoes || undefined,
          estagio: form.estagio,
          valorDisponivel,
        });
      }
      setModal(null);
      load();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Contato) {
    if (!confirm(`Excluir "${c.nome}"?`)) return;
    try {
      await deleteContato(c.id);
      load();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao excluir');
    }
  }

  function formatValor(v: number | string | null | undefined): string {
    if (v == null || v === '') return '';
    const n = Number(v);
    return Number.isNaN(n) ? '' : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function handleExportar() {
    const cols = ['Nome', 'E-mail', 'Telefone', 'Origem', 'Estágio', 'Valor disponível', 'Responsável', 'Observações'];
    const header = cols.join(';');
    const rows = lista.map((c) =>
      [
        (c.nome ?? '').replace(/;/g, ','),
        (c.email ?? '').replace(/;/g, ','),
        (c.telefone ?? '').replace(/;/g, ','),
        (c.origem ?? '').replace(/;/g, ',').replace(/\n/g, ' '),
        ESTAGIO_LABEL[c.estagio as keyof typeof ESTAGIO_LABEL] ?? c.estagio,
        formatValor(c.valorDisponivel),
        (c.usuarioResponsavel?.nome ?? '').replace(/;/g, ','),
        (c.observacoes ?? '').replace(/;/g, ',').replace(/\n/g, ' '),
      ].join(';')
    );
    const csv = '\uFEFF' + header + '\r\n' + rows.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contatos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <AppLayout><div className="contatos-loading">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="contatos-page">
        <h1>Contatos</h1>
        <p className="lead">Leads e contatos do CRM.</p>
        {erro && <p className="contatos-erro">{erro}</p>}
        <div className="contatos-toolbar">
          <div className="contatos-filtros">
            <label htmlFor="contatos-filtro-estagio">Estágio</label>
            <select
              id="contatos-filtro-estagio"
              className="contatos-filtro-select"
              value={filtroEstagio}
              onChange={(e) => setFiltroEstagio(e.target.value)}
            >
              <option value="">Todos</option>
              {ESTAGIOS.map((e) => (
                <option key={e} value={e}>{ESTAGIO_LABEL[e]}</option>
              ))}
            </select>
          </div>
          <div className="contatos-toolbar-actions">
            <button type="button" className="contatos-btn-export" onClick={handleExportar} disabled={lista.length === 0}>
              Exportar planilha
            </button>
            <button type="button" className="contatos-btn-new" onClick={openNew}>
              Novo contato
            </button>
          </div>
        </div>
        <div className="contatos-table-wrap">
          <table className="contatos-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Estágio</th>
                <th>Interesses (imóveis)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id}>
                  <td>{c.nome}</td>
                  <td>{c.email}</td>
                  <td>{c.telefone ?? '–'}</td>
                  <td className="estagio">{ESTAGIO_LABEL[c.estagio as keyof typeof ESTAGIO_LABEL] ?? c.estagio}</td>
                  <td className="contatos-interesses">
                    {c.interesses && c.interesses.length > 0 ? (
                      <ul className="contatos-interesses-list">
                        {c.interesses.map((int) => (
                          <li key={int.id}>
                            <button
                              type="button"
                              className="contatos-interesse-link"
                              onClick={() => navigate(`/imoveis/${int.imovel.id}`)}
                            >
                              {int.imovel.codigo || int.imovel.tipo}
                              {[int.imovel.bairro, int.imovel.cidade].filter(Boolean).length ? ` – ${[int.imovel.bairro, int.imovel.cidade].filter(Boolean).join(', ')}` : ''}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      '–'
                    )}
                  </td>
                  <td>
                    <div className="contatos-actions">
                      <button type="button" className="btn-secondary" onClick={() => setDetailContato(c)} title="Ver detalhes do lead">
                        Ver
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => navigate(`/tarefas?contatoId=${c.id}`)} title="Nova tarefa para este cliente">
                        Tarefa
                      </button>
                      <button type="button" className="btn-secondary" onClick={() => openEdit(c)}>Editar</button>
                      <button type="button" className="btn-danger" onClick={() => handleDelete(c)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lista.length === 0 && (
            <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
              Nenhum contato. Clique em &quot;Novo contato&quot; para cadastrar.
            </p>
          )}
        </div>
      </div>

      {modal && (
        <div className="contatos-modal-overlay" onClick={() => setModal(null)}>
          <div className="contatos-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal === 'novo' ? 'Novo contato' : 'Editar contato'}</h2>
            <form onSubmit={handleSubmit} className="contatos-form">
              <label>Nome *</label>
              <input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                required
              />
              <label>E-mail *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
              <label>Telefone</label>
              <input
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              />
              <label>Origem</label>
              <input
                value={form.origem}
                onChange={(e) => setForm((f) => ({ ...f, origem: e.target.value }))}
              />
              <label>Estágio</label>
              <select
                value={form.estagio}
                onChange={(e) => setForm((f) => ({ ...f, estagio: e.target.value }))}
              >
                {ESTAGIOS.map((e) => (
                  <option key={e} value={e}>{ESTAGIO_LABEL[e]}</option>
                ))}
              </select>
              <label>Valor disponível (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder="Ex.: valor máximo para imóvel"
                value={form.valorDisponivel}
                onChange={(e) => setForm((f) => ({ ...f, valorDisponivel: e.target.value }))}
              />
              <label>Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              />
              <div className="contatos-form-actions">
                <button type="button" className="btn-secondary" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-success" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {detailContato && (
        <LeadDetailModal
          contato={detailContato}
          onClose={() => setDetailContato(null)}
          onSaved={() => { setDetailContato(null); load(); }}
        />
      )}
    </AppLayout>
  );
}
