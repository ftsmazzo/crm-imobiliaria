import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmpreendimento, createEmpreendimento, updateEmpreendimento } from '../api';
import { buscarPorCep } from '../viacep';
import AppLayout from '../components/AppLayout';
import './EmpreendimentoCadastro.css';

const emptyForm = () => ({
  nome: '',
  cep: '',
  numeroEndereco: '',
  endereco: '',
  descricao: '',
});

export default function EmpreendimentoCadastro() {
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
      getEmpreendimento(id)
        .then((e) => {
          setForm({
            nome: e.nome,
            cep: '',
            numeroEndereco: '',
            endereco: e.endereco ?? '',
            descricao: e.descricao ?? '',
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
        await createEmpreendimento({
          nome: form.nome,
          endereco: form.endereco || undefined,
          descricao: form.descricao || undefined,
        });
        navigate('/empreendimentos', { replace: true });
      } else if (id) {
        await updateEmpreendimento(id, {
          nome: form.nome,
          endereco: form.endereco || undefined,
          descricao: form.descricao || undefined,
        });
        navigate('/empreendimentos', { replace: true });
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AppLayout><div className="empreendimento-cadastro-loading">Carregando...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="empreendimento-cadastro-page">
        <header className="empreendimento-cadastro-header">
          <h1>{isNew ? 'Novo empreendimento' : 'Editar empreendimento'}</h1>
        </header>

        <form onSubmit={handleSubmit} className="empreendimento-cadastro-form">
          {erro && <p className="empreendimento-cadastro-erro">{erro}</p>}

          <section className="empreendimento-cadastro-section">
            <div className="field">
              <label htmlFor="nome">Nome *</label>
              <input id="nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} required />
            </div>
          </section>

          <section className="empreendimento-cadastro-section">
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

          <section className="empreendimento-cadastro-section">
            <div className="field">
              <label htmlFor="descricao">Descrição</label>
              <textarea id="descricao" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} rows={3} />
            </div>
          </section>

          <footer className="empreendimento-cadastro-actions">
            <button type="button" className="secondary" onClick={() => navigate('/empreendimentos')}>
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
