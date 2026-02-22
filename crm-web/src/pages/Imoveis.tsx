import { useEffect, useState } from 'react';
import { getImoveis, createImovel, updateImovel, deleteImovel } from '../api';
import type { Imovel } from '../types';
import AppLayout from '../components/AppLayout';
import './Imoveis.css';

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
  if (v == null) return '–';
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (Number.isNaN(n)) return '–';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export default function Imoveis() {
  const [lista, setLista] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState<'novo' | Imovel | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

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
    setModal(i);
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
        <p className="lead">Cadastro de imóveis para venda e locação.</p>
        {erro && <p className="imoveis-erro">{erro}</p>}
        <div className="imoveis-toolbar">
          <button type="button" className="imoveis-btn-new" onClick={openNew}>
            Novo imóvel
          </button>
        </div>
        <div className="imoveis-grid">
          {lista.map((i) => (
            <div key={i.id} className="imovel-card">
              <div className="imovel-card-tipo">{i.tipo}</div>
              <div className="imovel-card-endereco">
                {[i.rua, i.numero, i.bairro, i.cidade].filter(Boolean).join(', ') || i.codigo || 'Sem endereço'}
              </div>
              <div className="imovel-card-valores">
                {i.valorVenda != null && <>Venda: {formatValor(i.valorVenda)}</>}
                {i.valorVenda != null && i.valorAluguel != null && ' · '}
                {i.valorAluguel != null && <>Aluguel: {formatValor(i.valorAluguel)}</>}
                {i.valorVenda == null && i.valorAluguel == null && '–'}
              </div>
              <div className="imovel-card-actions">
                <button type="button" onClick={() => openEdit(i)}>Editar</button>
                <button type="button" onClick={() => handleDelete(i)}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
        {lista.length === 0 && (
          <p style={{ padding: 'var(--crm-space-8)', textAlign: 'center', color: 'var(--crm-text-muted)' }}>
            Nenhum imóvel. Clique em &quot;Novo imóvel&quot; para cadastrar.
          </p>
        )}
      </div>

      {modal && (
        <div className="imoveis-modal-overlay" onClick={() => setModal(null)}>
          <div className="imoveis-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal === 'novo' ? 'Novo imóvel' : 'Editar imóvel'}</h2>
            <form onSubmit={handleSubmit} className="imoveis-form">
              <label>Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
              >
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
              <label>Código</label>
              <input
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              />
              <label>Rua</label>
              <input
                value={form.rua}
                onChange={(e) => setForm((f) => ({ ...f, rua: e.target.value }))}
              />
              <div className="imoveis-form-row">
                <div>
                  <label>Número</label>
                  <input
                    value={form.numero}
                    onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
                  />
                </div>
                <div>
                  <label>Bairro</label>
                  <input
                    value={form.bairro}
                    onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))}
                  />
                </div>
              </div>
              <div className="imoveis-form-row">
                <div>
                  <label>Cidade</label>
                  <input
                    value={form.cidade}
                    onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))}
                  />
                </div>
                <div>
                  <label>CEP</label>
                  <input
                    value={form.cep}
                    onChange={(e) => setForm((f) => ({ ...f, cep: e.target.value }))}
                  />
                </div>
              </div>
              <div className="imoveis-form-row">
                <div>
                  <label>Valor venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valorVenda ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, valorVenda: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
                <div>
                  <label>Valor aluguel (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.valorAluguel ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, valorAluguel: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
              </div>
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="disponivel">Disponível</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
                <option value="alugado">Alugado</option>
              </select>
              <label>Quartos / Banheiros / Área (m²)</label>
              <div className="imoveis-form-row imoveis-form-row-3">
                <input
                  type="number"
                  placeholder="Quartos"
                  value={form.qtdQuartos ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, qtdQuartos: e.target.value ? Number(e.target.value) : undefined }))}
                />
                <input
                  type="number"
                  placeholder="Banheiros"
                  value={form.qtdBanheiros ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, qtdBanheiros: e.target.value ? Number(e.target.value) : undefined }))}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Área"
                  value={form.area ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, area: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
              <label>Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
              <div className="imoveis-form-actions">
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
