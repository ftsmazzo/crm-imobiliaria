import { useEffect, useState } from 'react';
import { getTarefas, createTarefa, updateTarefa, deleteTarefa } from '../api';
import type { Tarefa as TarefaType } from '../types';
import AppLayout from '../components/AppLayout';
import './Tarefas.css';

function formatData(s: string | null): string {
  if (!s) return '–';
  try {
    return new Date(s).toLocaleDateString('pt-BR');
  } catch {
    return s;
  }
}

export default function Tarefas() {
  const [lista, setLista] = useState<TarefaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ titulo: '', descricao: '', dataPrevista: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getTarefas();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    setSaving(true);
    setErro('');
    try {
      await createTarefa({
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || undefined,
        dataPrevista: form.dataPrevista || undefined,
      });
      setModal(false);
      setForm({ titulo: '', descricao: '', dataPrevista: '' });
      load();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(t: TarefaType) {
    try {
      await updateTarefa(t.id, { concluida: !t.concluida });
      setLista((prev) =>
        prev.map((x) => (x.id === t.id ? { ...x, concluida: !x.concluida } : x))
      );
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao atualizar');
    }
  }

  async function handleDelete(t: TarefaType) {
    if (!confirm(`Excluir tarefa "${t.titulo}"?`)) return;
    try {
      await deleteTarefa(t.id);
      load();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao excluir');
    }
  }

  if (loading) return <AppLayout><div className="tarefas-loading">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="tarefas-page">
        <h1>Tarefas</h1>
        <p className="lead">Compromissos e follow-ups.</p>
        {erro && <p className="tarefas-erro">{erro}</p>}
        <div className="tarefas-toolbar">
          <button type="button" className="tarefas-btn-new" onClick={() => setModal(true)}>
            Nova tarefa
          </button>
        </div>
        <div className="tarefas-list">
          {lista.map((t) => (
            <div key={t.id} className={`tarefa-item ${t.concluida ? 'concluida' : ''}`}>
              <input
                type="checkbox"
                className="tarefa-check"
                checked={t.concluida}
                onChange={() => handleToggle(t)}
                aria-label={t.concluida ? 'Desmarcar' : 'Concluir'}
              />
              <div className="tarefa-body">
                <div className="tarefa-titulo">{t.titulo}</div>
                <div className="tarefa-meta">
                  {formatData(t.dataPrevista)}
                  {t.contato && ` · ${t.contato.nome}`}
                  {t.imovel && ` · Imóvel ${t.imovel.codigo || t.imovel.id}`}
                </div>
                {t.descricao && <div className="tarefa-desc">{t.descricao}</div>}
              </div>
              <div className="tarefa-actions">
                <button type="button" onClick={() => handleDelete(t)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
        {lista.length === 0 && (
          <p style={{ padding: 'var(--crm-space-8)', textAlign: 'center', color: 'var(--crm-text-muted)' }}>
            Nenhuma tarefa. Clique em &quot;Nova tarefa&quot; para criar.
          </p>
        )}
      </div>

      {modal && (
        <div className="tarefas-modal-overlay" onClick={() => setModal(false)}>
          <div className="tarefas-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Nova tarefa</h2>
            <form onSubmit={handleSubmit} className="tarefas-form">
              <label>Título *</label>
              <input
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Ex.: Ligar para o cliente"
                required
              />
              <label>Data prevista</label>
              <input
                type="date"
                value={form.dataPrevista}
                onChange={(e) => setForm((f) => ({ ...f, dataPrevista: e.target.value }))}
              />
              <label>Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
              <div className="tarefas-form-actions">
                <button type="button" className="secondary" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
