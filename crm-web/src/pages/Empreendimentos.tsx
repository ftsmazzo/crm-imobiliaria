import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmpreendimentos, deleteEmpreendimento } from '../api';
import type { Empreendimento } from '../types';
import AppLayout from '../components/AppLayout';
import './Empreendimentos.css';

export default function Empreendimentos() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<Empreendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getEmpreendimentos();
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

  async function handleDelete(e: Empreendimento) {
    if (!confirm(`Excluir empreendimento "${e.nome}"? Imóveis vinculados ficarão sem empreendimento.`)) return;
    try {
      await deleteEmpreendimento(e.id);
      load();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  }

  if (loading) {
    return <AppLayout><div className="empreendimentos-loading">Carregando...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="empreendimentos-page">
        <h1>Empreendimentos</h1>
        <p className="lead">Cadastre empreendimentos e condomínios para vincular aos imóveis.</p>
        {erro && <p className="empreendimentos-erro">{erro}</p>}
        <div className="empreendimentos-toolbar">
          <button type="button" className="empreendimentos-btn-new" onClick={() => navigate('/empreendimentos/novo')}>
            + Novo empreendimento
          </button>
        </div>

        {lista.length === 0 ? (
          <div className="empreendimentos-empty">
            <p>Nenhum empreendimento cadastrado.</p>
            <button type="button" className="empreendimentos-btn-new" onClick={() => navigate('/empreendimentos/novo')}>
              + Cadastrar primeiro empreendimento
            </button>
          </div>
        ) : (
          <div className="empreendimentos-list">
            {lista.map((emp) => (
              <div key={emp.id} className="empreendimento-card">
                <div className="empreendimento-card-body">
                  <strong>{emp.nome}</strong>
                  {emp.endereco && (
                    <p className="empreendimento-card-endereco">{emp.endereco}</p>
                  )}
                  {emp._count != null && emp._count.imoveis > 0 && (
                    <p className="empreendimento-card-imoveis">{emp._count.imoveis} imóvel(is) vinculado(s)</p>
                  )}
                </div>
                <div className="empreendimento-card-actions">
                  <button type="button" onClick={() => navigate(`/empreendimentos/${emp.id}/editar`)}>Editar</button>
                  <button type="button" onClick={() => handleDelete(emp)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
