import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { limparParaProducao, type LimparParaProducaoResult } from '../api';
import { getUser } from '../auth';
import AppLayout from '../components/AppLayout';
import './Administracao.css';

export default function Administracao() {
  const user = getUser();
  const [confirmando, setConfirmando] = useState(false);
  const [digitado, setDigitado] = useState('');
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<LimparParaProducaoResult | null>(null);
  const [erro, setErro] = useState('');

  const isGestor = user?.role === 'gestor';
  const podeExecutar = digitado.toUpperCase() === 'LIMPAR';

  function abrirConfirmacao() {
    setConfirmando(true);
    setDigitado('');
    setResultado(null);
    setErro('');
  }

  function fecharConfirmacao() {
    setConfirmando(false);
    setDigitado('');
  }

  async function executar() {
    if (!podeExecutar) return;
    setExecutando(true);
    setErro('');
    try {
      const res = await limparParaProducao();
      setResultado(res);
      setConfirmando(false);
      setDigitado('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao executar');
    } finally {
      setExecutando(false);
    }
  }

  if (!isGestor) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout>
      <div className="administracao-page">
        <h1>Administração</h1>
        <p className="administracao-lead">
          Ações restritas a gestores. Use com cuidado.
        </p>

        <section className="administracao-card">
          <h2>Limpar para produção</h2>
          <p>
            Remove todos os <strong>imóveis</strong>, <strong>contatos</strong> (leads), <strong>interesses</strong>,{' '}
            <strong>tarefas</strong>, <strong>documentos de processo</strong> e <strong>proprietários</strong>.
            Os códigos dos imóveis voltarão a começar do zero (ex.: AP-00001).
          </p>
          <p className="administracao-mantido">
            <strong>Mantidos:</strong> usuários, configuração do site (logo, hero, textos), tipos de documento e empreendimentos.
          </p>
          <button
            type="button"
            className="administracao-btn-limpar"
            onClick={abrirConfirmacao}
          >
            Limpar dados de desenvolvimento
          </button>
        </section>

        {resultado && (
          <section className="administracao-resultado">
            <p className="administracao-resultado-msg">{resultado.message}</p>
            <ul className="administracao-resultado-lista">
              {Object.entries(resultado.removidos).map(([k, v]) => (
                <li key={k}>
                  {k}: <strong>{v}</strong>
                </li>
              ))}
            </ul>
          </section>
        )}

        {confirmando && (
          <div className="administracao-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
            <div className="administracao-modal">
              <h2 id="admin-confirm-title">Confirmar limpeza</h2>
              <p>
                Esta ação não pode ser desfeita. Todos os imóveis, leads, tarefas e vínculos serão removidos.
              </p>
              <p>
                Digite <strong>LIMPAR</strong> para confirmar:
              </p>
              <input
                type="text"
                value={digitado}
                onChange={(e) => setDigitado(e.target.value)}
                placeholder="LIMPAR"
                className="administracao-input-confirm"
                autoCapitalize="characters"
                autoComplete="off"
              />
              {erro && <p className="administracao-erro">{erro}</p>}
              <div className="administracao-modal-actions">
                <button
                  type="button"
                  className="administracao-btn-cancel"
                  onClick={fecharConfirmacao}
                  disabled={executando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="administracao-btn-executar"
                  onClick={executar}
                  disabled={!podeExecutar || executando}
                >
                  {executando ? 'Executando...' : 'Limpar tudo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
