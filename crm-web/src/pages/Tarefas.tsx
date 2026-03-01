import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTarefas, createTarefa, updateTarefa, deleteTarefa, getContatos, getUsuarios, getImoveis } from '../api';
import type { Tarefa as TarefaType } from '../types';
import type { Contato } from '../types';
import type { Imovel } from '../types';
import type { UsuarioListItem } from '../api';
import AppLayout from '../components/AppLayout';
import { getUser } from '../auth';
import './Tarefas.css';

function formatData(s: string | null): string {
  if (!s) return '–';
  try {
    return new Date(s).toLocaleDateString('pt-BR');
  } catch {
    return s;
  }
}

const emptyForm = () => ({
  contatoId: '',
  usuarioId: '',
  imovelId: '',
  titulo: '',
  descricao: '',
  dataPrevista: '',
});

export default function Tarefas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const contatoIdFromUrl = searchParams.get('contatoId') || '';

  const [lista, setLista] = useState<TarefaType[]>([]);
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'atrasadas' | 'em_dia'>('todas');
  const openedFromUrlRef = useRef(false);

  const currentUser = getUser();
  const isGestor = currentUser?.role === 'gestor';

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const [tarefasRes, contatosRes, usuariosRes, imoveisRes] = await Promise.all([
        getTarefas(filtroUsuario ? { usuarioId: filtroUsuario } : undefined),
        getContatos(),
        getUsuarios(),
        getImoveis(),
      ]);
      setLista(tarefasRes);
      setContatos(contatosRes);
      setUsuarios(usuariosRes);
      setImoveis(imoveisRes);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [filtroUsuario]);

  useEffect(() => {
    if (!contatoIdFromUrl || contatos.length === 0 || usuarios.length === 0 || openedFromUrlRef.current) return;
    openedFromUrlRef.current = true;
    setForm((f) => ({
      ...f,
      contatoId: contatoIdFromUrl,
      usuarioId: usuarios.length === 1 ? usuarios[0].id : '',
    }));
    setModal(true);
    setSearchParams({}, { replace: true });
  }, [contatoIdFromUrl, contatos.length, usuarios.length, setSearchParams]);

  const listaFiltrada = lista.filter((t) => {
    if (filtroStatus === 'todas') return true;
    const hoje = new Date().toISOString().slice(0, 10);
    const prev = t.dataPrevista ? new Date(t.dataPrevista).toISOString().slice(0, 10) : null;
    if (filtroStatus === 'atrasadas') return prev && prev < hoje && !t.concluida;
    if (filtroStatus === 'em_dia') return !prev || prev >= hoje || t.concluida;
    return true;
  });

  function openNew() {
    setForm((f) => ({
      ...emptyForm(),
      usuarioId: usuarios.length === 1 ? usuarios[0].id : '',
    }));
    setModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    if (!form.contatoId) {
      setErro('Selecione o cliente.');
      return;
    }
    if (!form.usuarioId) {
      setErro('Selecione quem vai cumprir a tarefa.');
      return;
    }
    setSaving(true);
    setErro('');
    try {
      await createTarefa({
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || undefined,
        dataPrevista: form.dataPrevista || undefined,
        contatoId: form.contatoId || undefined,
        imovelId: form.imovelId || undefined,
        usuarioId: form.usuarioId || undefined,
      });
      setModal(false);
      setForm(emptyForm());
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
        <p className="lead">Compromissos e follow-ups. Vincule ao cliente e atribua a quem vai cumprir.</p>
        {erro && <p className="tarefas-erro">{erro}</p>}
        <div className="tarefas-toolbar">
          <div className="tarefas-filtros">
            {isGestor && (
              <select
                value={filtroUsuario}
                onChange={(e) => setFiltroUsuario(e.target.value)}
                className="tarefas-filtro-select"
              >
                <option value="">Todos os usuários</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            )}
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as 'todas' | 'atrasadas' | 'em_dia')}
              className="tarefas-filtro-select"
            >
              <option value="todas">Todas</option>
              <option value="atrasadas">Atrasadas</option>
              <option value="em_dia">Em dia</option>
            </select>
          </div>
          <button type="button" className="tarefas-btn-new" onClick={openNew}>
            Nova tarefa
          </button>
        </div>
        <div className="tarefas-list">
          {listaFiltrada.map((t) => (
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
                  {t.usuario && ` · ${t.usuario.nome}`}
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
        {listaFiltrada.length === 0 && (
          <p style={{ padding: 'var(--crm-space-8)', textAlign: 'center', color: 'var(--crm-text-muted)' }}>
            Nenhuma tarefa. Clique em &quot;Nova tarefa&quot; ou use &quot;Nova tarefa&quot; no Pipeline/Contatos.
          </p>
        )}
      </div>

      {modal && (
        <div className="tarefas-modal-overlay" onClick={() => setModal(false)}>
          <div className="tarefas-modal tarefas-modal-wide" onClick={(e) => e.stopPropagation()}>
            <h2>Nova tarefa</h2>
            <form onSubmit={handleSubmit} className="tarefas-form">
              <label>Cliente *</label>
              <select
                value={form.contatoId}
                onChange={(e) => setForm((f) => ({ ...f, contatoId: e.target.value }))}
                required
              >
                <option value="">Selecione o cliente</option>
                {contatos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome} – {c.email}</option>
                ))}
              </select>
              <label>Atribuir a (quem vai cumprir) *</label>
              <select
                value={form.usuarioId}
                onChange={(e) => setForm((f) => ({ ...f, usuarioId: e.target.value }))}
                required
              >
                <option value="">Selecione o usuário</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
              <label>Imóvel (opcional)</label>
              <select
                value={form.imovelId}
                onChange={(e) => setForm((f) => ({ ...f, imovelId: e.target.value }))}
              >
                <option value="">Nenhum</option>
                {imoveis.map((i) => (
                  <option key={i.id} value={i.id}>{i.codigo || i.tipo} – {[i.bairro, i.cidade].filter(Boolean).join(', ') || 'Sem endereço'}</option>
                ))}
              </select>
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
