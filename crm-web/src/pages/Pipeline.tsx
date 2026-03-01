import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContatos, updateContato } from '../api';
import type { Contato, Estagio } from '../types';
import { ESTAGIOS } from '../types';
import AppLayout from '../components/AppLayout';
import './Pipeline.css';

function PipelineCard({ c, onMudarEstagio }: { c: Contato; onMudarEstagio: (c: Contato, e: string) => void }) {
  const navigate = useNavigate();
  const [showResumo, setShowResumo] = useState(false);
  return (
    <div
      className="pipeline-card"
      onMouseEnter={() => setShowResumo(true)}
      onMouseLeave={() => setShowResumo(false)}
    >
      <div className="pipeline-card-nome">{c.nome}</div>
      <div className="pipeline-card-email">{c.email}</div>
      {showResumo && (
        <div className="pipeline-card-resumo" role="tooltip">
          {c.telefone && <p><strong>Telefone:</strong> {c.telefone}</p>}
          {c.origem && <p><strong>Origem:</strong> {c.origem}</p>}
          {c.observacoes && <p><strong>Observações:</strong> {c.observacoes}</p>}
          {!c.telefone && !c.origem && !c.observacoes && <p className="pipeline-card-resumo-vazio">Sem dados adicionais</p>}
        </div>
      )}
      <div className="pipeline-card-actions">
        <button
          type="button"
          className="pipeline-card-btn-tarefa"
          onClick={(e) => { e.stopPropagation(); navigate(`/tarefas?contatoId=${c.id}`); }}
          title="Nova tarefa para este lead"
        >
          Nova tarefa
        </button>
        <select
          className="pipeline-card-select"
          value={c.estagio}
          onChange={(ev) => onMudarEstagio(c, ev.target.value)}
          onClick={(e) => e.stopPropagation()}
        >
          {ESTAGIOS.map((e) => (
            <option key={e} value={e}>{ESTAGIO_LABEL[e]}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const ESTAGIO_LABEL: Record<Estagio, string> = {
  novo: 'Novo',
  qualificado: 'Qualificado',
  visita: 'Visita',
  proposta: 'Proposta',
  fechado: 'Fechado',
};

export default function Pipeline() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getContatos();
      setContatos(data);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMudarEstagio(contato: Contato, novoEstagio: string) {
    try {
      await updateContato(contato.id, { estagio: novoEstagio });
      setContatos((prev) =>
        prev.map((c) => (c.id === contato.id ? { ...c, estagio: novoEstagio } : c))
      );
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao atualizar');
    }
  }

  if (loading) return <AppLayout><div className="pipeline-loading">Carregando...</div></AppLayout>;
  if (erro && contatos.length === 0) return <AppLayout><div className="pipeline-erro">{erro}</div></AppLayout>;

  const porEstagio = (estagio: string) => contatos.filter((c) => c.estagio === estagio);

  return (
    <AppLayout>
      <div className="pipeline-page">
        <h1>Pipeline</h1>
        <p className="lead">Leads por estágio. Altere o estágio no card para mover.</p>
        <div className="pipeline-board">
          {ESTAGIOS.map((estagio) => (
            <div key={estagio} className="pipeline-col">
              <div className="pipeline-col-header">
                <span>{ESTAGIO_LABEL[estagio]}</span>
                <span className="pipeline-col-count">{porEstagio(estagio).length}</span>
              </div>
              <div className="pipeline-cards">
                {porEstagio(estagio).map((c) => (
                  <PipelineCard key={c.id} c={c} onMudarEstagio={handleMudarEstagio} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
