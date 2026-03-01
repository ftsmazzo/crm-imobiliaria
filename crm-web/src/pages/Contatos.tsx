import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContatos, createContato, updateContato, deleteContato } from '../api';
import type { Contato } from '../types';
import { ESTAGIOS } from '../types';
import AppLayout from '../components/AppLayout';
import './Contatos.css';

const emptyForm = () => ({
  nome: '',
  email: '',
  telefone: '',
  origem: '',
  observacoes: '',
  estagio: 'novo',
});

export default function Contatos() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState<'novo' | Contato | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getContatos();
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
    setModal('novo');
  }

  function openEdit(c: Contato) {
    setForm({
      nome: c.nome,
      email: c.email,
      telefone: c.telefone ?? '',
      origem: c.origem ?? '',
      observacoes: c.observacoes ?? '',
      estagio: c.estagio,
    });
    setModal(c);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErro('');
    try {
      if (modal === 'novo') {
        await createContato({
          nome: form.nome,
          email: form.email,
          telefone: form.telefone || undefined,
          origem: form.origem || undefined,
          observacoes: form.observacoes || undefined,
          estagio: form.estagio,
        });
      } else if (modal) {
        await updateContato(modal.id, {
          nome: form.nome,
          email: form.email,
          telefone: form.telefone || undefined,
          origem: form.origem || undefined,
          observacoes: form.observacoes || undefined,
          estagio: form.estagio,
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

  if (loading) return <AppLayout><div className="contatos-loading">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="contatos-page">
        <h1>Contatos</h1>
        <p className="lead">Leads e contatos do CRM.</p>
        {erro && <p className="contatos-erro">{erro}</p>}
        <div className="contatos-toolbar">
          <span />
          <button type="button" className="contatos-btn-new" onClick={openNew}>
            Novo contato
          </button>
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
                  <td className="estagio">{c.estagio}</td>
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
                      <button type="button" onClick={() => navigate(`/tarefas?contatoId=${c.id}`)} title="Nova tarefa para este cliente">
                        Tarefa
                      </button>
                      <button type="button" onClick={() => openEdit(c)}>Editar</button>
                      <button type="button" onClick={() => handleDelete(c)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {lista.length === 0 && (
            <p style={{ padding: 'var(--crm-space-6)', textAlign: 'center', color: 'var(--crm-text-muted)' }}>
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
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <label>Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              />
              <div className="contatos-form-actions">
                <button type="button" className="secondary" onClick={() => setModal(null)}>
                  Cancelar
                </button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
