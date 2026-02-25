import { useEffect, useState } from 'react';
import { getProprietarios, createProprietario, updateProprietario, deleteProprietario, consultaCnpj } from '../api';
import type { Proprietario } from '../types';
import AppLayout from '../components/AppLayout';
import './Proprietarios.css';

const emptyForm = () => ({
  nome: '',
  cpf: '',
  rg: '',
  dataNascimento: '',
  estadoCivil: '',
  telefone: '',
  telefone2: '',
  email: '',
  endereco: '',
  observacoes: '',
  tipo: '',
  razaoSocial: '',
  cnpj: '',
  inscricaoEstadual: '',
  repLegalNome: '',
  repLegalCpf: '',
  repLegalContato: '',
  repLegalEmail: '',
});

export default function Proprietarios() {
  const [lista, setLista] = useState<Proprietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState<'novo' | Proprietario | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [cnpjMsg, setCnpjMsg] = useState<'ok' | string | null>(null);

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getProprietarios();
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

  function openEdit(p: Proprietario) {
    setForm({
      nome: p.nome,
      cpf: p.cpf ?? '',
      rg: p.rg ?? '',
      dataNascimento: p.dataNascimento ?? '',
      estadoCivil: p.estadoCivil ?? '',
      telefone: p.telefone ?? '',
      telefone2: p.telefone2 ?? '',
      email: p.email ?? '',
      endereco: p.endereco ?? '',
      observacoes: p.observacoes ?? '',
      tipo: p.tipo ?? '',
      razaoSocial: p.razaoSocial ?? '',
      cnpj: p.cnpj ?? '',
      inscricaoEstadual: p.inscricaoEstadual ?? '',
      repLegalNome: p.repLegalNome ?? '',
      repLegalCpf: p.repLegalCpf ?? '',
      repLegalContato: p.repLegalContato ?? '',
      repLegalEmail: p.repLegalEmail ?? '',
    });
    setModal(p);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErro('');
    try {
      if (modal === 'novo') {
        await createProprietario({
          nome: form.nome,
          cpf: form.cpf || undefined,
          rg: form.rg || undefined,
          dataNascimento: form.dataNascimento || undefined,
          estadoCivil: form.estadoCivil || undefined,
          telefone: form.telefone || undefined,
          telefone2: form.telefone2 || undefined,
          email: form.email || undefined,
          endereco: form.endereco || undefined,
          observacoes: form.observacoes || undefined,
          tipo: form.tipo || undefined,
          razaoSocial: form.razaoSocial || undefined,
          cnpj: form.cnpj || undefined,
          inscricaoEstadual: form.inscricaoEstadual || undefined,
          repLegalNome: form.repLegalNome || undefined,
          repLegalCpf: form.repLegalCpf || undefined,
          repLegalContato: form.repLegalContato || undefined,
          repLegalEmail: form.repLegalEmail || undefined,
        });
      } else if (modal) {
        await updateProprietario(modal.id, {
          nome: form.nome,
          cpf: form.cpf || undefined,
          rg: form.rg || undefined,
          dataNascimento: form.dataNascimento || undefined,
          estadoCivil: form.estadoCivil || undefined,
          telefone: form.telefone || undefined,
          telefone2: form.telefone2 || undefined,
          email: form.email || undefined,
          endereco: form.endereco || undefined,
          observacoes: form.observacoes || undefined,
          tipo: form.tipo || undefined,
          razaoSocial: form.razaoSocial || undefined,
          cnpj: form.cnpj || undefined,
          inscricaoEstadual: form.inscricaoEstadual || undefined,
          repLegalNome: form.repLegalNome || undefined,
          repLegalCpf: form.repLegalCpf || undefined,
          repLegalContato: form.repLegalContato || undefined,
          repLegalEmail: form.repLegalEmail || undefined,
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

  async function buscarCnpj(cnpjVal?: string) {
    const cnpj = (cnpjVal ?? form.cnpj) || '';
    if (cnpj.replace(/\D/g, '').length !== 14) return;
    setCnpjMsg(null);
    setCnpjLoading(true);
    try {
      const data = await consultaCnpj(cnpj);
      if (data.ok) {
        setForm((f) => ({
          ...f,
          tipo: 'PJ',
          razaoSocial: data.razaoSocial || f.razaoSocial,
          endereco: data.endereco || f.endereco,
          repLegalContato: data.telefone || f.repLegalContato,
          repLegalEmail: data.email || f.repLegalEmail,
        }));
        setCnpjMsg('ok');
      } else {
        setCnpjMsg(data.message || 'CNPJ não encontrado');
      }
    } catch (e) {
      setCnpjMsg(e instanceof Error ? e.message : 'Erro ao consultar CNPJ');
    } finally {
      setCnpjLoading(false);
    }
  }

  async function handleDelete(p: Proprietario) {
    if (!confirm(`Excluir proprietário ${p.nome}?`)) return;
    try {
      await deleteProprietario(p.id);
      load();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao excluir');
    }
  }

  if (loading) {
    return <AppLayout><div className="proprietarios-loading">Carregando...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="proprietarios-page">
        <h1>Proprietários</h1>
        <p className="lead">Cadastre proprietários para vincular aos imóveis.</p>
        {erro && <p className="proprietarios-erro">{erro}</p>}
        <div className="proprietarios-toolbar">
          <button type="button" className="proprietarios-btn-new" onClick={openNew}>
            + Novo proprietário
          </button>
        </div>

        {lista.length === 0 ? (
          <div className="proprietarios-empty">
            <p>Nenhum proprietário cadastrado.</p>
            <button type="button" className="proprietarios-btn-new" onClick={openNew}>
              + Cadastrar primeiro proprietário
            </button>
          </div>
        ) : (
          <div className="proprietarios-list">
            {lista.map((p) => (
              <div key={p.id} className="proprietario-card">
                <div className="proprietario-card-body">
                  <strong>{p.nome}</strong>
                  {(p.telefone || p.email) && (
                    <p className="proprietario-card-contato">
                      {[p.telefone, p.email].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {p.cpf && <p className="proprietario-card-cpf">CPF: {p.cpf}</p>}
                  {p._count != null && p._count.imoveis > 0 && (
                    <p className="proprietario-card-imoveis">{p._count.imoveis} imóvel(is) vinculado(s)</p>
                  )}
                </div>
                <div className="proprietario-card-actions">
                  <button type="button" onClick={() => openEdit(p)}>Editar</button>
                  <button type="button" onClick={() => handleDelete(p)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="proprietarios-modal-overlay" onClick={() => setModal(null)}>
          <div className="proprietarios-modal" onClick={(e) => e.stopPropagation()}>
            <div className="proprietarios-modal-header">
              <h2>{modal === 'novo' ? 'Novo proprietário' : 'Editar proprietário'}</h2>
            </div>
            <form onSubmit={handleSubmit} className="proprietarios-form">
              <div className="proprietarios-modal-body">
                <h3 className="proprietarios-form-section">Dados do proprietário (PF)</h3>
                <div className="field">
                  <label htmlFor="prop-nome">Nome *</label>
                  <input id="prop-nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
                </div>
                <div className="field-row">
<div className="field">
                  <label htmlFor="prop-cpf">CPF</label>
                  <input id="prop-cpf" value={form.cpf} onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" title="Preencha manualmente; não há API gratuita para consulta por CPF" />
                  </div>
                  <div className="field">
                    <label htmlFor="prop-rg">RG</label>
                    <input id="prop-rg" value={form.rg} onChange={(e) => setForm((f) => ({ ...f, rg: e.target.value }))} />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="prop-dn">Data de nascimento</label>
                    <input id="prop-dn" type="date" value={form.dataNascimento} onChange={(e) => setForm((f) => ({ ...f, dataNascimento: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label htmlFor="prop-estadoCivil">Estado civil</label>
                    <input id="prop-estadoCivil" value={form.estadoCivil} onChange={(e) => setForm((f) => ({ ...f, estadoCivil: e.target.value }))} placeholder="Solteiro, Casado, etc." />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="prop-telefone">Telefone</label>
                    <input id="prop-telefone" value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label htmlFor="prop-telefone2">Telefone 2</label>
                    <input id="prop-telefone2" value={form.telefone2} onChange={(e) => setForm((f) => ({ ...f, telefone2: e.target.value }))} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="prop-email">E-mail</label>
                  <input id="prop-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="prop-endereco">Endereço</label>
                  <input id="prop-endereco" value={form.endereco} onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))} />
                </div>

                <h3 className="proprietarios-form-section">Dados do proprietário (PJ)</h3>
                <div className="field">
                  <label htmlFor="prop-razaoSocial">Razão social</label>
                  <input id="prop-razaoSocial" value={form.razaoSocial} onChange={(e) => setForm((f) => ({ ...f, razaoSocial: e.target.value }))} />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="prop-cnpj">CNPJ</label>
                    <div className="proprietarios-cnpj-row">
                      <input
                        id="prop-cnpj"
                        value={form.cnpj}
                        onChange={(e) => { setForm((f) => ({ ...f, cnpj: e.target.value })); setCnpjMsg(null); }}
                        onBlur={(e) => {
                          const v = (e.target as HTMLInputElement).value;
                          if (v.replace(/\D/g, '').length === 14) buscarCnpj(v);
                        }}
                        placeholder="00.000.000/0000-00"
                      />
                      <button type="button" className="proprietarios-cnpj-btn" onClick={() => buscarCnpj()} disabled={cnpjLoading || (form.cnpj || '').replace(/\D/g, '').length !== 14}>
                        {cnpjLoading ? 'Buscando...' : 'Buscar'}
                      </button>
                    </div>
                    {cnpjMsg === 'ok' && <span className="proprietarios-cnpj-ok">Dados preenchidos.</span>}
                    {cnpjMsg && cnpjMsg !== 'ok' && <span className="proprietarios-cnpj-erro">{cnpjMsg}</span>}
                  </div>
                  <div className="field">
                    <label htmlFor="prop-inscricaoEstadual">Inscrição estadual</label>
                    <input id="prop-inscricaoEstadual" value={form.inscricaoEstadual} onChange={(e) => setForm((f) => ({ ...f, inscricaoEstadual: e.target.value }))} />
                  </div>
                </div>

                <h3 className="proprietarios-form-section">Representante legal</h3>
                <div className="field">
                  <label htmlFor="prop-repLegalNome">Nome</label>
                  <input id="prop-repLegalNome" value={form.repLegalNome} onChange={(e) => setForm((f) => ({ ...f, repLegalNome: e.target.value }))} />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="prop-repLegalCpf">CPF</label>
                    <input id="prop-repLegalCpf" value={form.repLegalCpf} onChange={(e) => setForm((f) => ({ ...f, repLegalCpf: e.target.value }))} />
                  </div>
                  <div className="field">
                    <label htmlFor="prop-repLegalContato">Contato</label>
                    <input id="prop-repLegalContato" value={form.repLegalContato} onChange={(e) => setForm((f) => ({ ...f, repLegalContato: e.target.value }))} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="prop-repLegalEmail">E-mail</label>
                  <input id="prop-repLegalEmail" type="email" value={form.repLegalEmail} onChange={(e) => setForm((f) => ({ ...f, repLegalEmail: e.target.value }))} />
                </div>

                <div className="field">
                  <label htmlFor="prop-observacoes">Observações</label>
                  <textarea id="prop-observacoes" value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
                </div>
              </div>
              <div className="proprietarios-form-actions">
                <button type="button" className="secondary" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
