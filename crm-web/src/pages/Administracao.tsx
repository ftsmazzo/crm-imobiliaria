import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  limparParaProducao,
  getDisparoAmareloPendentes,
  executarDisparoAmarelo,
  type LimparParaProducaoResult,
  type DisparoAmareloPendente,
  type DisparoAmareloResult,
} from '../api';
import { getUser } from '../auth';
import AppLayout from '../components/AppLayout';
import './Administracao.css';

const MODELO_MENSAGEM = `*Imóvel [CÓDIGO]* está há [X] dias sem verificação de disponibilidade.

Confirme se ainda está disponível. Para confirmar pelo WhatsApp, responda:
*confirmar [CÓDIGO]*`;

export default function Administracao() {
  const user = getUser();
  const [confirmando, setConfirmando] = useState(false);
  const [digitado, setDigitado] = useState('');
  const [executando, setExecutando] = useState(false);
  const [resultado, setResultado] = useState<LimparParaProducaoResult | null>(null);
  const [erro, setErro] = useState('');
  const [pendentes, setPendentes] = useState<DisparoAmareloPendente[] | null>(null);
  const [disparoResult, setDisparoResult] = useState<DisparoAmareloResult | null>(null);
  const [loadingPendentes, setLoadingPendentes] = useState(false);
  const [loadingDisparo, setLoadingDisparo] = useState(false);

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

  async function carregarPendentes() {
    setLoadingPendentes(true);
    setDisparoResult(null);
    try {
      const list = await getDisparoAmareloPendentes();
      setPendentes(list);
    } catch (e) {
      setPendentes([]);
      setErro(e instanceof Error ? e.message : 'Erro ao carregar pendentes');
    } finally {
      setLoadingPendentes(false);
    }
  }

  async function dispararAgora() {
    setLoadingDisparo(true);
    setErro('');
    try {
      const res = await executarDisparoAmarelo();
      setDisparoResult(res);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao disparar');
    } finally {
      setLoadingDisparo(false);
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
            className="administracao-btn-limpar btn-danger"
            onClick={abrirConfirmacao}
          >
            Limpar dados de desenvolvimento
          </button>
        </section>

        <section className="administracao-card">
          <h2>Notificação imóvel amarelo</h2>
          <p>
            Imóveis com 15 a 30 dias sem verificação entram no “amarelo”. Um cron diário às 9h envia mensagem
            ao corretor responsável pelo WhatsApp (Evolution API). Aqui você pode ver quem está pendente e qual
            mensagem será enviada, e disparar manualmente para testar.
          </p>
          <div className="administracao-modelo-msg">
            <strong>Modelo da mensagem:</strong>
            <pre>{MODELO_MENSAGEM}</pre>
          </div>
          <div className="administracao-disparo-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={carregarPendentes}
              disabled={loadingPendentes}
            >
              {loadingPendentes ? 'Carregando...' : 'Ver pendentes'}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={dispararAgora}
              disabled={loadingDisparo}
            >
              {loadingDisparo ? 'Disparando...' : 'Disparar agora'}
            </button>
          </div>
          {pendentes !== null && (
            <div className="administracao-pendentes">
              <h3>Pendentes ({pendentes.length})</h3>
              {pendentes.length === 0 ? (
                <p>Nenhum imóvel pendente de notificação amarela.</p>
              ) : (
                <ul className="administracao-pendentes-lista">
                  {pendentes.map((p) => (
                    <li key={p.id} className="administracao-pendente-item">
                      <span className="administracao-pendente-cod">{p.codigo || p.id.slice(0, 8)}</span>
                      <span>
                        {p.usuarioResponsavel?.nome ?? 'Sem responsável'} · {p.diasDesdeVerificacao} dias
                      </span>
                      <pre className="administracao-pendente-msg">{p.mensagem}</pre>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {disparoResult && (
            <div className="administracao-disparo-result">
              <p>Enviados: <strong>{disparoResult.enviados}</strong></p>
              <p>Sem telefone: <strong>{disparoResult.semTelefone}</strong></p>
              <p>Erros: <strong>{disparoResult.erros}</strong></p>
            </div>
          )}
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
                  className="administracao-btn-cancel btn-secondary"
                  onClick={fecharConfirmacao}
                  disabled={executando}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="administracao-btn-executar btn-success"
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
