import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getUsuarios, createUsuario, updateUsuario } from '../api';
import type { UsuarioListItem } from '../api';
import { getUser } from '../auth';
import AppLayout from '../components/AppLayout';
import './Usuarios.css';

type FormState = { nome: string; email: string; senha: string; role: string; ativo: boolean; telefone: string };

const emptyForm: FormState = { nome: '', email: '', senha: '', role: 'corretor', ativo: true, telefone: '' };

export default function Usuarios() {
  const user = getUser();
  const [lista, setLista] = useState<UsuarioListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState<'novo' | UsuarioListItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const isGestor = user?.role === 'gestor';

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getUsuarios();
      setLista(data);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isGestor) load();
  }, [isGestor]);

  function openNew() {
    setForm(emptyForm);
    setModal('novo');
  }

  function openEdit(u: UsuarioListItem) {
    setForm({
      nome: u.nome,
      email: u.email ?? '',
      senha: '',
      role: u.role ?? 'corretor',
      ativo: u.ativo !== false,
      telefone: u.telefone ?? '',
    });
    setModal(u);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modal) return;
    setSaving(true);
    setErro('');
    try {
      if (modal === 'novo') {
        if (!form.senha.trim()) {
          setErro('Senha é obrigatória para novo usuário');
          setSaving(false);
          return;
        }
        await createUsuario({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          role: form.role,
          telefone: form.telefone.trim() || undefined,
        });
      } else {
        const payload: { nome?: string; email?: string; senha?: string; role?: string; ativo?: boolean; telefone?: string } = {
          nome: form.nome.trim(),
          email: form.email.trim(),
          role: form.role,
          ativo: form.ativo,
          telefone: form.telefone.trim() || undefined,
        };
        if (form.senha.trim()) payload.senha = form.senha;
        await updateUsuario(modal.id, payload);
      }
      setModal(null);
      load();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (!isGestor) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <AppLayout><div className="usuarios-loading">Carregando...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="usuarios-page">
        <h1>Usuários / Equipe</h1>
        <p className="usuarios-lead">Gerencie corretores e gestores. Apenas gestores veem esta página.</p>
        {erro && <p className="usuarios-erro">{erro}</p>}
        <div className="usuarios-toolbar">
          <button type="button" className="usuarios-btn-new" onClick={openNew}>
            + Novo usuário
          </button>
        </div>

        {lista.length === 0 ? (
          <div className="usuarios-empty">
            <p>Nenhum usuário além de você.</p>
            <button type="button" className="usuarios-btn-new" onClick={openNew}>+ Cadastrar usuário</button>
          </div>
        ) : (
          <div className="usuarios-table-wrap">
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Ativo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((u) => (
                  <tr key={u.id} className={u.ativo === false ? 'usuarios-row-inativo' : ''}>
                    <td>{u.nome}</td>
                    <td>{u.email ?? '–'}</td>
                    <td><span className={`usuarios-badge usuarios-badge-${u.role ?? 'corretor'}`}>{u.role === 'gestor' ? 'Gestor' : 'Corretor'}</span></td>
                    <td>{u.ativo !== false ? 'Sim' : 'Não'}</td>
                    <td>
                      <button type="button" className="usuarios-btn-edit" onClick={() => openEdit(u)}>Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {modal && (
          <div className="usuarios-modal-overlay" onClick={() => !saving && setModal(null)}>
            <div className="usuarios-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{modal === 'novo' ? 'Novo usuário' : 'Editar usuário'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="usuarios-form-group">
                  <label htmlFor="usuarios-nome">Nome *</label>
                  <input id="usuarios-nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
                </div>
                <div className="usuarios-form-group">
                  <label htmlFor="usuarios-email">E-mail *</label>
                  <input id="usuarios-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required disabled={modal !== 'novo' && modal.id === user?.id} />
                  {modal !== 'novo' && modal.id === user?.id && <p className="usuarios-hint">Seu próprio e-mail não pode ser alterado aqui.</p>}
                </div>
                <div className="usuarios-form-group">
                  <label htmlFor="usuarios-telefone">WhatsApp (para notificação de imóvel amarelo)</label>
                  <input id="usuarios-telefone" type="tel" value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} placeholder="11999999999" />
                </div>
                <div className="usuarios-form-group">
                  <label htmlFor="usuarios-senha">{modal === 'novo' ? 'Senha *' : 'Nova senha (deixe em branco para não alterar)'}</label>
                  <input id="usuarios-senha" type="password" value={form.senha} onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))} placeholder={modal !== 'novo' ? '••••••••' : ''} minLength={modal === 'novo' ? 6 : 0} />
                </div>
                <div className="usuarios-form-group">
                  <label htmlFor="usuarios-role">Perfil</label>
                  <select id="usuarios-role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} disabled={modal !== 'novo' && modal.id === user?.id}>
                    <option value="corretor">Corretor</option>
                    <option value="gestor">Gestor</option>
                  </select>
                  {modal !== 'novo' && modal.id === user?.id && <p className="usuarios-hint">Você não pode alterar seu próprio perfil.</p>}
                </div>
                {modal !== 'novo' && (
                  <div className="usuarios-form-group usuarios-form-checkbox">
                    <label>
                      <input type="checkbox" checked={form.ativo} onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))} disabled={modal.id === user?.id} />
                      Ativo
                    </label>
                    {modal.id === user?.id && <p className="usuarios-hint">Você não pode desativar sua própria conta.</p>}
                  </div>
                )}
                <div className="usuarios-modal-actions">
                  <button type="button" className="usuarios-btn-cancel btn-secondary" onClick={() => !saving && setModal(null)}>Cancelar</button>
                  <button type="submit" className="usuarios-btn-save btn-success" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
