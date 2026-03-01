import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContatos, getTarefas, updateContato } from '../api';
import type { Contato, Estagio } from '../types';
import { ESTAGIOS } from '../types';
import AppLayout from '../components/AppLayout';
import './Pipeline.css';

function formatTelefone(t: string | null): string {
  if (!t || !t.trim()) return '';
  const d = t.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return t;
}

function PipelineCard({
  c,
  tarefasPendentes,
  onMudarEstagio,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  c: Contato;
  tarefasPendentes: number;
  onMudarEstagio: (c: Contato, e: string) => void;
  onDragStart: (e: React.DragEvent, contato: Contato) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const navigate = useNavigate();
  const [showResumo, setShowResumo] = useState(false);
  return (
    <div
      className={`pipeline-card ${isDragging ? 'pipeline-card-dragging' : ''} ${showResumo ? 'pipeline-card-resumo-open' : ''}`}
      draggable
      onDragStart={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest('button') || t.closest('select')) {
          e.preventDefault();
          return;
        }
        onDragStart(e, c);
      }}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setShowResumo(true)}
      onMouseLeave={() => setShowResumo(false)}
    >
      <div className="pipeline-card-main">
        <div className="pipeline-card-nome">{c.nome}</div>
        <div className="pipeline-card-email">{c.email}</div>
        {c.telefone && (
          <div className="pipeline-card-tel">{formatTelefone(c.telefone)}</div>
        )}
        {c.origem && (
          <div className="pipeline-card-origem">Origem: {c.origem}</div>
        )}
        <div className={`pipeline-card-tarefas ${tarefasPendentes > 0 ? 'pipeline-card-tarefas-pendentes' : ''}`}>
          {tarefasPendentes === 0 && 'Nenhuma tarefa pendente'}
          {tarefasPendentes === 1 && '1 tarefa pendente'}
          {tarefasPendentes > 1 && `${tarefasPendentes} tarefas pendentes`}
        </div>
      </div>
      {showResumo && (
        <div className="pipeline-card-resumo" role="tooltip">
          {c.telefone && <p><strong>Telefone:</strong> {formatTelefone(c.telefone)}</p>}
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
  lead: 'Lead',
  qualificado: 'Qualificado',
  visita: 'Visita',
  proposta: 'Proposta',
  fechado: 'Fechado',
};

export default function Pipeline() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [tarefasPendentesPorContato, setTarefasPendentesPorContato] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [draggingContatoId, setDraggingContatoId] = useState<string | null>(null);
  const [dragOverEstagio, setDragOverEstagio] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const [contatosData, tarefasData] = await Promise.all([
        getContatos(),
        getTarefas(),
      ]);
      setContatos(contatosData);
      const pendentes: Record<string, number> = {};
      tarefasData
        .filter((t) => t.contatoId && !t.concluida)
        .forEach((t) => {
          const id = t.contatoId!;
          pendentes[id] = (pendentes[id] ?? 0) + 1;
        });
      setTarefasPendentesPorContato(pendentes);
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

  function handleDragStart(e: React.DragEvent, contato: Contato) {
    e.dataTransfer.setData('application/json', JSON.stringify({ contatoId: contato.id }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggingContatoId(contato.id);
  }

  function handleDragEnd() {
    setDraggingContatoId(null);
    setDragOverEstagio(null);
  }

  function handleDragOver(e: React.DragEvent, estagio: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverEstagio(estagio);
  }

  function handleDragLeave() {
    setDragOverEstagio(null);
  }

  function handleDrop(e: React.DragEvent, estagioAlvo: string) {
    e.preventDefault();
    setDragOverEstagio(null);
    setDraggingContatoId(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json') || '{}');
      const contatoId = data.contatoId as string | undefined;
      if (!contatoId) return;
      const contato = contatos.find((c) => c.id === contatoId);
      if (!contato || contato.estagio === estagioAlvo) return;
      handleMudarEstagio(contato, estagioAlvo);
    } catch {
      // ignore invalid drop data
    }
  }

  if (loading) return <AppLayout><div className="pipeline-loading">Carregando...</div></AppLayout>;
  if (erro && contatos.length === 0) return <AppLayout><div className="pipeline-erro">{erro}</div></AppLayout>;

  const porEstagio = (estagio: string) => contatos.filter((c) => c.estagio === estagio);
  const estagiosLinha1 = ESTAGIOS.slice(0, 3); // Novo, Lead, Qualificado
  const estagiosLinha2 = ESTAGIOS.slice(3, 6); // Visita, Proposta, Fechado

  return (
    <AppLayout>
      <div className="pipeline-page">
        <h1>Pipeline</h1>
        <p className="lead">Arraste os cards entre colunas para mudar o estágio.</p>
        <div className="pipeline-board pipeline-board-top">
          {estagiosLinha1.map((estagio) => (
            <div
              key={estagio}
              className={`pipeline-col ${dragOverEstagio === estagio ? 'pipeline-col-drag-over' : ''}`}
              data-estagio={estagio}
              onDragOver={(e) => handleDragOver(e, estagio)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, estagio)}
            >
              <div className="pipeline-col-header">
                <span>{ESTAGIO_LABEL[estagio]}</span>
                <span className="pipeline-col-count">{porEstagio(estagio).length}</span>
              </div>
              <div className="pipeline-cards">
                {porEstagio(estagio).map((c) => (
                  <PipelineCard
                    key={c.id}
                    c={c}
                    tarefasPendentes={tarefasPendentesPorContato[c.id] ?? 0}
                    onMudarEstagio={handleMudarEstagio}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDragging={draggingContatoId === c.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="pipeline-board pipeline-board-bottom">
          {estagiosLinha2.map((estagio) => (
            <div
              key={estagio}
              className={`pipeline-col ${dragOverEstagio === estagio ? 'pipeline-col-drag-over' : ''}`}
              data-estagio={estagio}
              onDragOver={(e) => handleDragOver(e, estagio)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, estagio)}
            >
              <div className="pipeline-col-header">
                <span>{ESTAGIO_LABEL[estagio]}</span>
                <span className="pipeline-col-count">{porEstagio(estagio).length}</span>
              </div>
              <div className="pipeline-cards">
                {porEstagio(estagio).map((c) => (
                  <PipelineCard
                    key={c.id}
                    c={c}
                    tarefasPendentes={tarefasPendentesPorContato[c.id] ?? 0}
                    onMudarEstagio={handleMudarEstagio}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    isDragging={draggingContatoId === c.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
