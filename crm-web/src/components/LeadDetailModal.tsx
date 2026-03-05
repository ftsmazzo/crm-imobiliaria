import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  updateContato,
  getUsuarios,
  getTiposDocumento,
  getContatoDocumentos,
  uploadContatoDocumento,
  getContatoDocumentoUrl,
  deleteContatoDocumento,
} from '../api';
import type { Contato } from '../types';
import type { UsuarioListItem, TipoDocumento, ProcessoDocumento } from '../api';
import { ESTAGIOS, ESTAGIO_LABEL } from '../types';
import { getUser } from '../auth';
import './LeadDetailModal.css';

type Props = {
  contato: Contato;
  onClose: () => void;
  onSaved?: (c: Contato) => void;
};

export default function LeadDetailModal({ contato, onClose, onSaved }: Props) {
  const navigate = useNavigate();
  const user = getUser();
  const isGestor = user?.role === 'gestor';
  const isCorretor = user?.role === 'corretor';
  const canReassign = isGestor || (isCorretor && contato.usuarioResponsavelId === user?.id);
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([]);
  const valorDisponivelNum = contato.valorDisponivel != null ? Number(contato.valorDisponivel) : undefined;
  const [form, setForm] = useState({
    nome: contato.nome,
    email: contato.email,
    telefone: contato.telefone ?? '',
    origem: contato.origem ?? '',
    observacoes: contato.observacoes ?? '',
    estagio: contato.estagio,
    valorDisponivel: valorDisponivelNum !== undefined && !Number.isNaN(valorDisponivelNum) ? String(valorDisponivelNum) : '',
    usuarioResponsavelId: contato.usuarioResponsavelId ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [documentosProcesso, setDocumentosProcesso] = useState<ProcessoDocumento[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    if (canReassign) {
      getUsuarios().then(setUsuarios).catch(() => setUsuarios([]));
    }
  }, [canReassign]);

  useEffect(() => {
    getTiposDocumento('processo').then(setTiposDoc).catch(() => setTiposDoc([]));
    getContatoDocumentos(contato.id).then(setDocumentosProcesso).catch(() => setDocumentosProcesso([]));
  }, [contato.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErro('');
    try {
      const valorNum = form.valorDisponivel ? parseFloat(form.valorDisponivel) : undefined;
      const updated = await updateContato(contato.id, {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone || undefined,
        origem: form.origem || undefined,
        observacoes: form.observacoes || undefined,
        estagio: form.estagio,
        valorDisponivel: valorNum !== undefined && !Number.isNaN(valorNum) ? valorNum : undefined,
        ...(canReassign && { usuarioResponsavelId: form.usuarioResponsavelId || undefined }),
      });
      onSaved?.(updated as Contato);
      onClose();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  function handleNovaTarefa() {
    navigate(`/tarefas?contatoId=${contato.id}`);
    onClose();
  }

  async function handleUploadDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !contato.id) return;
    e.target.value = '';
    setUploadingDoc(true);
    try {
      const tipoSelect = document.getElementById('lead-doc-tipo') as HTMLSelectElement | null;
      const tipoDocumentoId = tipoSelect?.value || undefined;
      await uploadContatoDocumento(contato.id, file, { tipoDocumentoId });
      const list = await getContatoDocumentos(contato.id);
      setDocumentosProcesso(list);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar documento');
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleVerDoc(docId: string) {
    try {
      const { url } = await getContatoDocumentoUrl(contato.id, docId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao abrir documento');
    }
  }

  async function handleExcluirDoc(docId: string) {
    if (!confirm('Excluir este documento?')) return;
    try {
      await deleteContatoDocumento(contato.id, docId);
      setDocumentosProcesso((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  return (
    <div className="lead-detail-overlay" onClick={onClose}>
      <div className="lead-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="lead-detail-header">
          <h2>Lead: {contato.nome}</h2>
          <button type="button" className="lead-detail-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="lead-detail-form">
          {erro && <p className="lead-detail-erro">{erro}</p>}
          <div className="lead-detail-grid">
            <div className="form-group">
              <label>Nome *</label>
              <input
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>E-mail *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Origem</label>
              <input
                value={form.origem}
                onChange={(e) => setForm((f) => ({ ...f, origem: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Valor disponível (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder="Ex.: valor máximo para imóvel"
                value={form.valorDisponivel}
                onChange={(e) => setForm((f) => ({ ...f, valorDisponivel: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Estágio</label>
              <select
                value={form.estagio}
                onChange={(e) => setForm((f) => ({ ...f, estagio: e.target.value }))}
              >
                {ESTAGIOS.map((e) => (
                  <option key={e} value={e}>{ESTAGIO_LABEL[e] ?? e}</option>
                ))}
              </select>
            </div>
            {canReassign && (
              <div className="form-group">
                <label>{isGestor ? 'Responsável' : 'Passar para'}</label>
                <select
                  value={form.usuarioResponsavelId}
                  onChange={(e) => setForm((f) => ({ ...f, usuarioResponsavelId: e.target.value }))}
                >
                  <option value="">Sem responsável</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="lead-detail-docs">
            <h3>Documentos do processo</h3>
            <p className="lead-detail-docs-hint">Proposta, contrato, laudo e outros PDFs do lead.</p>
            <div className="lead-detail-docs-upload">
              <select id="lead-doc-tipo" className="lead-detail-doc-tipo">
                <option value="">Tipo (opcional)</option>
                {tiposDoc.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
              <label className="lead-detail-docs-upload-btn">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={uploadingDoc}
                  onChange={handleUploadDoc}
                  style={{ display: 'none' }}
                />
                {uploadingDoc ? 'Enviando...' : 'Enviar PDF'}
              </label>
            </div>
            {documentosProcesso.length > 0 ? (
              <ul className="lead-detail-docs-list">
                {documentosProcesso.map((d) => (
                  <li key={d.id}>
                    <span className="lead-detail-doc-nome">{d.nomeOriginal || d.tipoDocumento?.nome || 'Documento'}</span>
                    {d.tipoDocumento && <span className="lead-detail-doc-tipo-badge">{d.tipoDocumento.nome}</span>}
                    <button type="button" className="lead-detail-doc-ver" onClick={() => handleVerDoc(d.id)}>Ver</button>
                    <button type="button" className="lead-detail-doc-excluir" onClick={() => handleExcluirDoc(d.id)}>Excluir</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="lead-detail-docs-vazio">Nenhum documento. Envie um PDF acima.</p>
            )}
          </div>

          <div className="lead-detail-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn-nova-tarefa" onClick={handleNovaTarefa}>
              Nova tarefa
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
