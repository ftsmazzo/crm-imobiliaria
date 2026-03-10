import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  getSiteConfig,
  updateSiteConfig,
  uploadSiteConfigLogo,
  uploadSiteConfigHero,
  removeSiteConfigLogo,
  removeSiteConfigHero,
  type SiteConfigAdmin,
} from '../api';
import { getUser } from '../auth';
import AppLayout from '../components/AppLayout';
import './PersonalizacaoSite.css';

export default function PersonalizacaoSite() {
  const user = getUser();
  const [config, setConfig] = useState<SiteConfigAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: '', whatsapp: '', endereco: '', creci: '' });
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const isGestor = user?.role === 'gestor';

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getSiteConfig();
      setConfig(data);
      setForm({
        nome: data.nome ?? '',
        whatsapp: data.whatsapp ?? '',
        endereco: data.endereco ?? '',
        creci: data.creci ?? '',
      });
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar configuração');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isGestor) load();
  }, [isGestor]);

  async function handleSubmitTexts(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErro('');
    try {
      const updated = await updateSiteConfig({
        nome: form.nome.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        endereco: form.endereco.trim() || undefined,
        creci: form.creci.trim() || undefined,
      });
      setConfig(updated);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro('');
    setSaving(true);
    try {
      const updated = await uploadSiteConfigLogo(file);
      setConfig(updated);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao enviar logo');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  }

  async function handleHeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro('');
    setSaving(true);
    try {
      const updated = await uploadSiteConfigHero(file);
      setConfig(updated);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao enviar imagem de fundo');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  }

  async function handleRemoveLogo() {
    setErro('');
    setSaving(true);
    try {
      const updated = await removeSiteConfigLogo();
      setConfig(updated);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao remover logo');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveHero() {
    setErro('');
    setSaving(true);
    try {
      const updated = await removeSiteConfigHero();
      setConfig(updated);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao remover imagem de fundo');
    } finally {
      setSaving(false);
    }
  }

  if (!isGestor) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="personalizacao-site-loading">Carregando...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="personalizacao-site-page">
        <h1>Personalização do site</h1>
        <p className="personalizacao-site-lead">
          Logo, imagem de fundo da busca e textos exibidos no site público. Apenas gestores podem alterar.
        </p>
        {erro && <p className="personalizacao-site-erro">{erro}</p>}

        <section className="personalizacao-site-section">
          <h2>Imagens</h2>
          <div className="personalizacao-site-images">
            <div className="personalizacao-site-image-block">
              <label>Logo (cabeçalho do site)</label>
              <div className="personalizacao-site-preview personalizacao-site-preview-logo">
                {config?.logoUrl ? (
                  <img src={config.logoUrl} alt="Logo atual" />
                ) : (
                  <span>Nenhuma logo definida</span>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="personalizacao-site-file-input"
                aria-label="Enviar logo"
              />
              <div className="personalizacao-site-buttons">
                <button
                  type="button"
                  className="personalizacao-site-btn-upload"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={saving}
                >
                  {config?.logoUrl ? 'Trocar logo' : 'Enviar logo'}
                </button>
                {config?.logoUrl && (
                  <button
                    type="button"
                    className="personalizacao-site-btn-remove"
                    onClick={handleRemoveLogo}
                    disabled={saving}
                  >
                    Remover logo
                  </button>
                )}
              </div>
            </div>
            <div className="personalizacao-site-image-block">
              <label>Imagem de fundo (atrás da busca na home)</label>
              <div className="personalizacao-site-preview personalizacao-site-preview-hero">
                {config?.heroImageUrl ? (
                  <img src={config.heroImageUrl} alt="Fundo hero atual" />
                ) : (
                  <span>Nenhuma imagem definida (usa gradiente)</span>
                )}
              </div>
              <input
                ref={heroInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleHeroChange}
                className="personalizacao-site-file-input"
                aria-label="Enviar imagem de fundo"
              />
              <div className="personalizacao-site-buttons">
                <button
                  type="button"
                  className="personalizacao-site-btn-upload"
                  onClick={() => heroInputRef.current?.click()}
                  disabled={saving}
                >
                  {config?.heroImageUrl ? 'Trocar imagem' : 'Enviar imagem de fundo'}
                </button>
                {config?.heroImageUrl && (
                  <button
                    type="button"
                    className="personalizacao-site-btn-remove"
                    onClick={handleRemoveHero}
                    disabled={saving}
                  >
                    Remover imagem
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="personalizacao-site-section">
          <h2>Textos do site</h2>
          <form onSubmit={handleSubmitTexts} className="personalizacao-site-form">
            <div className="personalizacao-site-field">
              <label htmlFor="ps-nome">Nome da imobiliária</label>
              <input
                id="ps-nome"
                type="text"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Imobiliária Exemplo"
              />
            </div>
            <div className="personalizacao-site-field">
              <label htmlFor="ps-whatsapp">WhatsApp (com DDI, só números)</label>
              <input
                id="ps-whatsapp"
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                placeholder="5511999999999"
              />
            </div>
            <div className="personalizacao-site-field">
              <label htmlFor="ps-endereco">Endereço</label>
              <input
                id="ps-endereco"
                type="text"
                value={form.endereco}
                onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
                placeholder="Av. Exemplo, 1000 - Centro"
              />
            </div>
            <div className="personalizacao-site-field">
              <label htmlFor="ps-creci">CRECI</label>
              <input
                id="ps-creci"
                type="text"
                value={form.creci}
                onChange={(e) => setForm((f) => ({ ...f, creci: e.target.value }))}
                placeholder="Opcional"
              />
            </div>
            <button type="submit" className="personalizacao-site-btn-save" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar textos'}
            </button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
