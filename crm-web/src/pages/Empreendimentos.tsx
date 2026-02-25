import { useEffect, useState } from 'react';
import { getEmpreendimentos, createEmpreendimento, updateEmpreendimento, deleteEmpreendimento } from '../api';
import type { Empreendimento } from '../types';
import AppLayout from '../components/AppLayout';
import './Empreendimentos.css';

const emptyForm = () => ({
  nome: '',
  descricao: '',
  endereco: '',
});

export default function Empreendimentos() {
  const [lista, setLista] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState<'novo' | Empreendimento | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getEmpreendimentos();
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

  function openEdit(e: Empreendimento) {
    setForm({
      nome: e.nome,
      descricao: e.descricao ?? '',
      endereco: e.endereco ?? '',
    });
    setModal(e);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    setErro('');
    try {
      if (modal === 'novo') {
        await createEmpreendimento({
          nome: form.nome,
          descricao: form.descricao || undefined,
          endereco: form.endereco || undefined,
        });
      } else if (modal) {
        await updateEmpreendimento(modal.id, {
          nome: form.nome,
          descricao: form.descricao || undefined,
          endereco: form.endereco || undefined,
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

  async function handleDelete(e: Empreendimento) {
    if (!confirm(`Excluir empreendimento "${e.nome}"? Imóveis vinculados ficarão sem empreendimento.`)) return;
    try {
      await deleteEmpreendimento(e.id);
      load();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="empreendimentos-loading">Carregando...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="empreendimentos-page">
        <h1>Empreendimentos</h1>
        <p className="lead">Cadastre empreendimentos e condomínios para vincular aos imóveis.</p>
        {erro && <p className="empreendimentos-erro">{erro}</p>}
        <div className="empreendimentos-toolbar">
          <button type="button" className="empreendimentos-btn-new" onClick={openNew}>
            + Novo empreendimento
          </button>
        </div>

        {lista.length === 0 ? (
          <div className="empreendimentos-empty">
            <p>Nenhum empreendimento cadastrado.</p>
            <button type="button" className="empreendimentos-btn-new" onClick={openNew}>
              + Cadastrar primeiro empreendimento
            </button>
          </div>
        ) : (
          <div className="empreendimentos-list">
            {lista.map((emp) => (
              <div key={emp.id} className="empreendimento-card">
                <div className="empreendimento-card-body">
                  <strong>{emp.nome}</strong>
                  {emp.endereco && (
                    <p className="empreendimento-card-endereco">{emp.endereco}</p>
                  )}
                  {emp._count != null && emp._count.imoveis > 0 && (
                    <p className="empreendimento-card-imoveis">{emp._count.imoveis} imóvel(is) vinculado(s)</p>
                  )}
                </div>
                <div className="empreendimento-card-actions">
                  <button type="button" onClick={() => openEdit(emp)}>Editar</button>
                  <button type="button" onClick={() => handleDelete(emp)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="empreendimentos-modal-overlay" onClick={() => setModal(null)}>
          <div className="empreendimentos-modal" onClick={(ev) => ev.stopPropagation()}>
            <div className="empreendimentos-modal-header">
              <h2>{modal === 'novo' ? 'Novo empreendimento' : 'Editar empreendimento'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="empreendimentos-form">
              <div className="empreendimentos-modal-body">
                <div className="field">
                  <label htmlFor="emp-nome">Nome *</label>
                  <input
                    id="emp-nome"
                    value={form.nome}
                    onChange={(ev) => setForm((f) => ({ ...f, nome: ev.target.value }))}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="emp-endereco">Endereço</label>
                  <input
                    id="emp-endereco"
                    value={form.endereco}
                    onChange={(ev) => setForm((f) => ({ ...f, endereco: ev.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="emp-descricao">Descrição</label>
                  <textarea
                    id="emp-descricao"
                    value={form.descricao}
                    onChange={(ev) => setForm((f) => ({ ...f, descricao: ev.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="empreendimentos-form-actions">
                <button type="button" className="secondary" onClick={() => setModal(null)}>Cancelar</button>
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
