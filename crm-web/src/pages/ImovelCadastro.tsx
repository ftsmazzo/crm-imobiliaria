import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getImovel,
  createImovel,
  updateImovel,
  getImovelFotos,
  uploadImovelFoto,
  deleteImovelFoto,
  getEmpreendimentos,
  getContatos,
  type ImovelFoto,
} from '../api';
import type { Imovel } from '../types';
import { buscarPorCep } from '../viacep';
import AppLayout from '../components/AppLayout';
import './ImovelCadastro.css';

const TIPOS = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'casa_condominio', label: 'Casa em condomínio' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'terreno_condominio', label: 'Terreno em condomínio' },
  { value: 'comercial', label: 'Comercial' },
] as const;

const STEP_LABELS = [
  'Identificação',
  'Endereço',
  'Valores',
  'Características',
  'Descrição',
  'Proprietário',
  'Fotos',
] as const;

type FormState = Record<string, string | number | undefined>;

const emptyForm = (): FormState => ({
  tipo: 'apartamento',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  cep: '',
  valorVenda: undefined,
  valorAluguel: undefined,
  valorIptu: undefined,
  valorCondominio: undefined,
  status: 'disponivel',
  codigo: '',
  quadra: '',
  lote: '',
  descricao: '',
  qtdQuartos: undefined,
  qtdBanheiros: undefined,
  qtdSalas: undefined,
  lavabo: 0,
  area: undefined,
  areaTerreno: undefined,
  anoConstrucao: undefined,
  tipoPiso: '',
  empreendimentoId: '',
  proprietarioId: '',
});

export default function ImovelCadastro() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = id === 'novo' || !id;
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const stepFromUrl = Math.min(7, Math.max(1, Number(searchParams.get('step')) || 1));
  const [step, setStep] = useState(stepFromUrl);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMsg, setCepMsg] = useState<'ok' | 'not_found' | null>(null);
  const [empreendimentos, setEmpreendimentos] = useState<{ id: string; nome: string }[]>([]);
  const [contatos, setContatos] = useState<{ id: string; nome: string; email: string }[]>([]);
  const [fotos, setFotos] = useState<ImovelFoto[]>([]);
  const [fotosLoading, setFotosLoading] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  const totalSteps = isNew ? 6 : 7;
  const currentLabel = STEP_LABELS[step - 1];

  useEffect(() => {
    getEmpreendimentos().then((list) => setEmpreendimentos(list)).catch(() => setEmpreendimentos([]));
    getContatos().then((list) => setContatos(list)).catch(() => setContatos([]));
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      getImovel(id)
        .then((i) => {
          setForm({
            tipo: i.tipo,
            rua: i.rua ?? '',
            numero: i.numero ?? '',
            bairro: i.bairro ?? '',
            cidade: i.cidade ?? '',
            cep: i.cep ?? '',
            valorVenda: i.valorVenda != null ? Number(i.valorVenda) : undefined,
            valorAluguel: i.valorAluguel != null ? Number(i.valorAluguel) : undefined,
            valorIptu: i.valorIptu != null ? Number(i.valorIptu) : undefined,
            valorCondominio: i.valorCondominio != null ? Number(i.valorCondominio) : undefined,
            status: i.status,
            codigo: i.codigo ?? '',
            quadra: i.quadra ?? '',
            lote: i.lote ?? '',
            descricao: i.descricao ?? '',
            qtdQuartos: i.qtdQuartos ?? undefined,
            qtdBanheiros: i.qtdBanheiros ?? undefined,
            qtdSalas: i.qtdSalas ?? undefined,
            lavabo: i.lavabo ?? 0,
            area: i.area != null ? Number(i.area) : undefined,
            areaTerreno: i.areaTerreno != null ? Number(i.areaTerreno) : undefined,
            anoConstrucao: i.anoConstrucao ?? undefined,
            tipoPiso: i.tipoPiso ?? '',
            empreendimentoId: i.empreendimentoId ?? '',
            proprietarioId: i.proprietarioId ?? '',
          });
          return getImovelFotos(i.id);
        })
        .then(setFotos)
        .catch(() => setFotos([]))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

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
          rua: endereco.rua || (f.rua as string),
          bairro: endereco.bairro || (f.bairro as string),
          cidade: endereco.cidade || (f.cidade as string),
        }));
        setCepMsg('ok');
      } else {
        setCepMsg('not_found');
      }
    } finally {
      setCepLoading(false);
    }
  }

  function buildPayload(): Partial<Imovel> {
    return {
      tipo: String(form.tipo),
      rua: form.rua != null ? String(form.rua) : undefined,
      numero: form.numero != null ? String(form.numero) : undefined,
      bairro: form.bairro != null ? String(form.bairro) : undefined,
      cidade: form.cidade != null ? String(form.cidade) : undefined,
      cep: form.cep != null ? String(form.cep) : undefined,
      valorVenda: form.valorVenda != null ? Number(form.valorVenda) : undefined,
      valorAluguel: form.valorAluguel != null ? Number(form.valorAluguel) : undefined,
      valorIptu: form.valorIptu != null ? Number(form.valorIptu) : undefined,
      valorCondominio: form.valorCondominio != null ? Number(form.valorCondominio) : undefined,
      status: String(form.status),
      codigo: form.codigo != null ? String(form.codigo) : undefined,
      quadra: form.quadra ? String(form.quadra) : undefined,
      lote: form.lote ? String(form.lote) : undefined,
      descricao: form.descricao != null ? String(form.descricao) : undefined,
      qtdQuartos: form.qtdQuartos != null ? Number(form.qtdQuartos) : undefined,
      qtdBanheiros: form.qtdBanheiros != null ? Number(form.qtdBanheiros) : undefined,
      qtdSalas: form.qtdSalas != null ? Number(form.qtdSalas) : undefined,
      lavabo: form.lavabo != null ? Number(form.lavabo) : undefined,
      area: form.area != null ? Number(form.area) : undefined,
      areaTerreno: form.areaTerreno != null ? Number(form.areaTerreno) : undefined,
      anoConstrucao: form.anoConstrucao != null ? Number(form.anoConstrucao) : undefined,
      tipoPiso: form.tipoPiso ? String(form.tipoPiso) : undefined,
      empreendimentoId: form.empreendimentoId ? String(form.empreendimentoId) : undefined,
      proprietarioId: form.proprietarioId ? String(form.proprietarioId) : undefined,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErro('');
    try {
      const payload = buildPayload();
      if (isNew) {
        const created = await createImovel(payload);
        navigate(`/imoveis/${created.id}/editar?step=7`, { replace: true });
        return;
      } else if (id) {
        await updateImovel(id, payload);
        if (step < 7) setStep(7);
        else navigate('/imoveis');
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (loading && !isNew) {
    return (
      <AppLayout>
        <div className="imovel-cadastro-page">
          <p>Carregando...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="imovel-cadastro-page">
        <header className="imovel-cadastro-header">
          <h1>{isNew ? 'Novo imóvel' : 'Editar imóvel'}</h1>
          <div className="imovel-cadastro-stepper">
            <div className="imovel-cadastro-stepper-bar-wrap" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
              <div className="imovel-cadastro-stepper-bar" style={{ width: `${(100 * (step - 1)) / Math.max(1, totalSteps - 1)}%` }} />
            </div>
            <p className="imovel-cadastro-stepper-label">Etapa {step} de {totalSteps}: {currentLabel}</p>
            <div className="imovel-cadastro-stepper-dots">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                <span key={s} className={s <= step ? 'active' : ''} aria-hidden />
              ))}
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="imovel-cadastro-form">
          {erro && <p className="imovel-cadastro-erro">{erro}</p>}

          {step === 1 && (
            <section className="imovel-cadastro-section">
              <h2>Identificação</h2>
              <div className="field">
                <label>Tipo do imóvel</label>
                <div className="imovel-cadastro-tipos">
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
              <div className="field-row">
                <div className="field">
                  <label htmlFor="codigo">Código (opcional)</label>
                  <input id="codigo" value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))} placeholder="Ex: APT-101" />
                </div>
                <div className="field">
                  <label htmlFor="quadra">Quadra (interno)</label>
                  <input id="quadra" value={form.quadra} onChange={(e) => setForm((f) => ({ ...f, quadra: e.target.value }))} placeholder="Quadra" />
                </div>
                <div className="field">
                  <label htmlFor="lote">Lote (interno)</label>
                  <input id="lote" value={form.lote} onChange={(e) => setForm((f) => ({ ...f, lote: e.target.value }))} placeholder="Lote" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="empreendimento">Empreendimento / Condomínio</label>
                <select
                  id="empreendimento"
                  value={form.empreendimentoId}
                  onChange={(e) => setForm((f) => ({ ...f, empreendimentoId: e.target.value }))}
                >
                  <option value="">Nenhum</option>
                  {empreendimentos.map((e) => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="imovel-cadastro-section">
              <h2>Endereço</h2>
              <div className="field imovel-cep-field">
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
                {cepMsg === 'ok' && !cepLoading && <span className="hint ok">Preenchido automaticamente</span>}
                {cepMsg === 'not_found' && !cepLoading && <span className="hint not-found">CEP não encontrado.</span>}
              </div>
              <div className="field">
                <label htmlFor="rua">Rua / Logradouro</label>
                <input id="rua" value={form.rua} onChange={(e) => setForm((f) => ({ ...f, rua: e.target.value }))} placeholder="Rua ou avenida" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="numero">Número</label>
                  <input id="numero" value={form.numero} onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))} placeholder="Nº" />
                </div>
                <div className="field">
                  <label htmlFor="bairro">Bairro</label>
                  <input id="bairro" value={form.bairro} onChange={(e) => setForm((f) => ({ ...f, bairro: e.target.value }))} placeholder="Bairro" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="cidade">Cidade</label>
                <input id="cidade" value={form.cidade} onChange={(e) => setForm((f) => ({ ...f, cidade: e.target.value }))} placeholder="Cidade" />
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="imovel-cadastro-section">
              <h2>Valores e status</h2>
              <div className="field-row field-row-4">
                <div className="field">
                  <label htmlFor="valorVenda">Valor venda (R$)</label>
                  <input id="valorVenda" type="number" step="0.01" min="0" value={form.valorVenda ?? ''} onChange={(e) => setForm((f) => ({ ...f, valorVenda: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" />
                </div>
                <div className="field">
                  <label htmlFor="valorAluguel">Valor aluguel (R$)</label>
                  <input id="valorAluguel" type="number" step="0.01" min="0" value={form.valorAluguel ?? ''} onChange={(e) => setForm((f) => ({ ...f, valorAluguel: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" />
                </div>
                <div className="field">
                  <label htmlFor="valorIptu">IPTU (R$)</label>
                  <input id="valorIptu" type="number" step="0.01" min="0" value={form.valorIptu ?? ''} onChange={(e) => setForm((f) => ({ ...f, valorIptu: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" />
                </div>
                <div className="field">
                  <label htmlFor="valorCondominio">Condomínio (R$)</label>
                  <input id="valorCondominio" type="number" step="0.01" min="0" value={form.valorCondominio ?? ''} onChange={(e) => setForm((f) => ({ ...f, valorCondominio: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="status">Status</label>
                <select id="status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="disponivel">Disponível</option>
                  <option value="reservado">Reservado</option>
                  <option value="vendido">Vendido</option>
                  <option value="alugado">Alugado</option>
                </select>
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="imovel-cadastro-section">
              <h2>Características</h2>
              <div className="field-row field-row-4">
                <div className="field">
                  <label htmlFor="qtdQuartos">Quartos</label>
                  <input id="qtdQuartos" type="number" min="0" value={form.qtdQuartos ?? ''} onChange={(e) => setForm((f) => ({ ...f, qtdQuartos: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" />
                </div>
                <div className="field">
                  <label htmlFor="qtdBanheiros">Banheiros</label>
                  <input id="qtdBanheiros" type="number" min="0" value={form.qtdBanheiros ?? ''} onChange={(e) => setForm((f) => ({ ...f, qtdBanheiros: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" />
                </div>
                <div className="field">
                  <label htmlFor="qtdSalas">Salas</label>
                  <input id="qtdSalas" type="number" min="0" value={form.qtdSalas ?? ''} onChange={(e) => setForm((f) => ({ ...f, qtdSalas: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" />
                </div>
                <div className="field">
                  <label htmlFor="lavabo">Lavabo</label>
                  <input id="lavabo" type="number" min="0" value={form.lavabo ?? ''} onChange={(e) => setForm((f) => ({ ...f, lavabo: e.target.value ? Number(e.target.value) : 0 }))} placeholder="0" />
                </div>
              </div>
              <div className="field-row field-row-4">
                <div className="field">
                  <label htmlFor="area">Área construída (m²)</label>
                  <input id="area" type="number" step="0.01" min="0" value={form.area ?? ''} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" />
                </div>
                <div className="field">
                  <label htmlFor="areaTerreno">Área terreno (m²)</label>
                  <input id="areaTerreno" type="number" step="0.01" min="0" value={form.areaTerreno ?? ''} onChange={(e) => setForm((f) => ({ ...f, areaTerreno: e.target.value ? Number(e.target.value) : undefined }))} placeholder="0" />
                </div>
                <div className="field">
                  <label htmlFor="anoConstrucao">Ano construção</label>
                  <input id="anoConstrucao" type="number" min="1900" max={new Date().getFullYear() + 2} value={form.anoConstrucao ?? ''} onChange={(e) => setForm((f) => ({ ...f, anoConstrucao: e.target.value ? Number(e.target.value) : undefined }))} placeholder="Ex: 2020" />
                </div>
                <div className="field">
                  <label htmlFor="tipoPiso">Tipo de piso</label>
                  <input id="tipoPiso" value={form.tipoPiso} onChange={(e) => setForm((f) => ({ ...f, tipoPiso: e.target.value }))} placeholder="Ex: porcelanato" />
                </div>
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="imovel-cadastro-section">
              <h2>Descrição</h2>
              <div className="field">
                <label htmlFor="descricao">Observações ou descrição</label>
                <textarea id="descricao" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} placeholder="Detalhes do imóvel..." />
              </div>
            </section>
          )}

          {step === 6 && (
            <section className="imovel-cadastro-section">
              <h2>Proprietário</h2>
              <div className="field">
                <label htmlFor="proprietario">Vincular proprietário (contato)</label>
                <select
                  id="proprietario"
                  value={form.proprietarioId}
                  onChange={(e) => setForm((f) => ({ ...f, proprietarioId: e.target.value }))}
                >
                  <option value="">Nenhum</option>
                  {contatos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome} – {c.email}</option>
                  ))}
                </select>
              </div>
            </section>
          )}

          {step === 7 && !isNew && id && (
            <section className="imovel-cadastro-section">
              <h2>Fotos do imóvel</h2>
              <div className="field">
                <label>Enviar foto (até 10 MB)</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingFoto}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !id) return;
                    setUploadingFoto(true);
                    try {
                      await uploadImovelFoto(id, file);
                      const list = await getImovelFotos(id);
                      setFotos(list);
                    } catch (err) {
                      console.error(err);
                      alert('Falha ao enviar foto.');
                    } finally {
                      setUploadingFoto(false);
                      e.target.value = '';
                    }
                  }}
                />
                {uploadingFoto && <span className="hint">Enviando...</span>}
              </div>
              {fotosLoading ? (
                <p>Carregando fotos...</p>
              ) : fotos.length > 0 ? (
                <ul className="imovel-cadastro-fotos">
                  {fotos.map((f) => (
                    <li key={f.id}>
                      {f.url ? <img src={f.url} alt="" /> : <span className="thumb-placeholder" />}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm('Remover esta foto?')) return;
                          try {
                            await deleteImovelFoto(id, f.id);
                            setFotos((prev) => prev.filter((x) => x.id !== f.id));
                          } catch (err) {
                            alert('Falha ao remover.');
                          }
                        }}
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="hint">Nenhuma foto. Envie acima.</p>
              )}
            </section>
          )}

          <footer className="imovel-cadastro-actions">
            <button type="button" className="secondary" onClick={() => navigate('/imoveis')}>
              Cancelar
            </button>
            {step > 1 && (
              <button type="button" className="secondary" onClick={() => setStep((s) => s - 1)}>
                Anterior
              </button>
            )}
            {step < (isNew ? 6 : 7) ? (
              <button type="button" className="primary" onClick={() => setStep((s) => s + 1)}>
                Próximo
              </button>
            ) : (
              <button type="submit" className="primary" disabled={saving}>
                {saving ? 'Salvando...' : isNew ? 'Salvar imóvel' : 'Salvar'}
              </button>
            )}
          </footer>
        </form>
      </div>
    </AppLayout>
  );
}
