import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProprietario, createProprietario, updateProprietario } from '../api';
import { buscarPorCep } from '../viacep';
import type { Proprietario } from '../types';
import AppLayout from '../components/AppLayout';
import './ProprietarioCadastro.css';

const emptyForm = () => ({
  nome: '',
  cpf: '',
  rg: '',
  dataNascimento: '',
  estadoCivil: '',
  telefone: '',
  telefone2: '',
  email: '',
  cep: '',
  numeroEndereco: '',
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

export default function ProprietarioCadastro() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'novo' || !id;
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMsg, setCepMsg] = useState<'ok' | 'not_found' | null>(null);

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      getProprietario(id)
        .then((p) => {
          setForm({
            nome: p.nome,
            cpf: p.cpf ?? '',
            rg: p.rg ?? '',
            dataNascimento: p.dataNascimento ? String(p.dataNascimento).slice(0, 10) : '',
            estadoCivil: p.estadoCivil ?? '',
            telefone: p.telefone ?? '',
            telefone2: p.telefone2 ?? '',
            email: p.email ?? '',
            cep: '',
            numeroEndereco: '',
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
        })
        .catch(() => setErro('Erro ao carregar'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  async function handleCepBlur() {
    const cep = String(form.cep ?? '').trim().replace(/\D/g, '');
    if (cep.length !== 8) {
      setCepMsg(null);
      return;
    }
    setCepLoading(true);
    setCepMsg(null);
    try {
      const end = await buscarPorCep(cep);
      if (end) {
        setForm((f) => ({
          ...f,
          cep: end.cep,
          endereco: [end.rua, f.numeroEndereco, end.bairro, end.cidade].filter(Boolean).join(', ') + ` - CEP ${end.cep}`,
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
      if (isNew) {
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
        navigate('/proprietarios', { replace: true });
      } else if (id) {
        await updateProprietario(id, {
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
        navigate('/proprietarios', { replace: true });
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AppLayout><div className="proprietario-cadastro-loading">Carregando...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="proprietario-cadastro-page">
        <header className="proprietario-cadastro-header">
          <h1>{isNew ? 'Novo proprietário' : 'Editar proprietário'}</h1>
        </header>

        <form onSubmit={handleSubmit} className="proprietario-cadastro-form">
          {erro && <p className="proprietario-cadastro-erro">{erro}</p>}

          <section className="proprietario-cadastro-section">
            <h2>Dados pessoais (PF)</h2>
            <div className="field">
              <label htmlFor="nome">Nome *</label>
              <input id="nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="cpf">CPF</label>
                <input id="cpf" value={form.cpf} onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))} placeholder="000.000.000-00" />
              </div>
              <div className="field">
                <label htmlFor="rg">RG</label>
                <input id="rg" value={form.rg} onChange={(e) => setForm((f) => ({ ...f, rg: e.target.value }))} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="dataNascimento">Data de nascimento</label>
                <input id="dataNascimento" type="date" value={form.dataNascimento} onChange={(e) => setForm((f) => ({ ...f, dataNascimento: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="estadoCivil">Estado civil</label>
                <input id="estadoCivil" value={form.estadoCivil} onChange={(e) => setForm((f) => ({ ...f, estadoCivil: e.target.value }))} placeholder="Solteiro, Casado, etc." />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="telefone">Telefone</label>
                <input id="telefone" value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="telefone2">Telefone 2</label>
                <input id="telefone2" value={form.telefone2} onChange={(e) => setForm((f) => ({ ...f, telefone2: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input id="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          </section>

          <section className="proprietario-cadastro-section">
            <h2>Endereço</h2>
            <div className="field-row">
              <div className="field cep-field">
                <label htmlFor="cep">CEP</label>
                <input
                  id="cep"
                  value={form.cep}
                  onChange={(e) => { setForm((f) => ({ ...f, cep: e.target.value })); setCepMsg(null); }}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  disabled={cepLoading}
                />
                {cepLoading && <span className="hint loading">Buscando...</span>}
                {cepMsg === 'ok' && !cepLoading && <span className="hint ok">Preenchido</span>}
                {cepMsg === 'not_found' && !cepLoading && <span className="hint not-found">CEP não encontrado</span>}
              </div>
              <div className="field">
                <label htmlFor="numeroEndereco">Número</label>
                <input id="numeroEndereco" value={form.numeroEndereco} onChange={(e) => setForm((f) => ({ ...f, numeroEndereco: e.target.value }))} placeholder="Nº" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="endereco">Endereço completo</label>
              <input id="endereco" value={form.endereco} onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))} placeholder="Rua, número, bairro, cidade" />
            </div>
          </section>

          <section className="proprietario-cadastro-section">
            <h2>Dados PJ (empresa)</h2>
            <div className="field">
              <label htmlFor="razaoSocial">Razão social</label>
              <input id="razaoSocial" value={form.razaoSocial} onChange={(e) => setForm((f) => ({ ...f, razaoSocial: e.target.value }))} />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="cnpj">CNPJ</label>
                <input id="cnpj" value={form.cnpj} onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" />
              </div>
              <div className="field">
                <label htmlFor="inscricaoEstadual">Inscrição estadual</label>
                <input id="inscricaoEstadual" value={form.inscricaoEstadual} onChange={(e) => setForm((f) => ({ ...f, inscricaoEstadual: e.target.value }))} />
              </div>
            </div>
          </section>

          <section className="proprietario-cadastro-section">
            <h2>Representante legal</h2>
            <div className="field">
              <label htmlFor="repLegalNome">Nome</label>
              <input id="repLegalNome" value={form.repLegalNome} onChange={(e) => setForm((f) => ({ ...f, repLegalNome: e.target.value }))} />
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="repLegalCpf">CPF</label>
                <input id="repLegalCpf" value={form.repLegalCpf} onChange={(e) => setForm((f) => ({ ...f, repLegalCpf: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="repLegalContato">Contato</label>
                <input id="repLegalContato" value={form.repLegalContato} onChange={(e) => setForm((f) => ({ ...f, repLegalContato: e.target.value }))} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="repLegalEmail">E-mail</label>
              <input id="repLegalEmail" type="email" value={form.repLegalEmail} onChange={(e) => setForm((f) => ({ ...f, repLegalEmail: e.target.value }))} />
            </div>
          </section>

          <section className="proprietario-cadastro-section">
            <div className="field">
              <label htmlFor="observacoes">Observações</label>
              <textarea id="observacoes" value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} rows={3} />
            </div>
          </section>

          <footer className="proprietario-cadastro-actions">
            <button type="button" className="secondary" onClick={() => navigate('/proprietarios')}>
              Cancelar
            </button>
            <button type="submit" className="primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </footer>
        </form>
      </div>
    </AppLayout>
  );
}
