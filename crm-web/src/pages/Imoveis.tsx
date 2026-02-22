import { useEffect, useState } from 'react';
import { getImoveis, createImovel, updateImovel, deleteImovel } from '../api';
import type { Imovel } from '../types';
import { buscarPorCep } from '../viacep';
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
        await createImovel(payload);
      } else if (modal) {
        await updateImovel(modal.id, payload);
      }
      setModal(null);
      load();
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

  if (loading) return <AppLayout><div className="imoveis-loading">Carregando...</div></AppLayout>;

  return (
    <AppLayout>
      <div className="imoveis-page">
        <h1>Imóveis</h1>
        <p className="lead">Cadastre e gerencie imóveis para venda e locação.</p>
        {erro && <p className="imoveis-erro">{erro}</p>}
        <div className="imoveis-toolbar">
          <span />
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
    </AppLayout>
  );
}
