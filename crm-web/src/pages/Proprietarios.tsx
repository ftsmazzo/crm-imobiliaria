import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProprietarios, deleteProprietario } from '../api';
import type { Proprietario } from '../types';
import AppLayout from '../components/AppLayout';
import './Proprietarios.css';

export default function Proprietarios() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<Proprietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  async function load() {
    setLoading(true);
    setErro('');
    try {
      const data = await getProprietarios();
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

  async function handleDelete(p: Proprietario) {
    if (!confirm(`Excluir proprietário ${p.nome}?`)) return;
    try {
      await deleteProprietario(p.id);
      load();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao excluir');
    }
  }

  if (loading) {
    return <AppLayout><div className="proprietarios-loading">Carregando...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="proprietarios-page">
        <h1>Proprietários</h1>
        <p className="lead">Cadastre proprietários para vincular aos imóveis.</p>
        {erro && <p className="proprietarios-erro">{erro}</p>}
        <div className="proprietarios-toolbar">
          <button type="button" className="proprietarios-btn-new" onClick={() => navigate('/proprietarios/novo')}>
            + Novo proprietário
          </button>
        </div>

        {lista.length === 0 ? (
          <div className="proprietarios-empty">
            <p>Nenhum proprietário cadastrado.</p>
            <button type="button" className="proprietarios-btn-new" onClick={() => navigate('/proprietarios/novo')}>
              + Cadastrar primeiro proprietário
            </button>
          </div>
        ) : (
          <div className="proprietarios-list">
            {lista.map((p) => (
              <div key={p.id} className="proprietario-card">
                <div className="proprietario-card-body">
                  <strong>{p.nome}</strong>
                  {(p.telefone || p.email) && (
                    <p className="proprietario-card-contato">
                      {[p.telefone, p.email].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {p.cpf && <p className="proprietario-card-cpf">CPF: {p.cpf}</p>}
                  {p._count != null && p._count.imoveis > 0 && (
                    <p className="proprietario-card-imoveis">{p._count.imoveis} imóvel(is) vinculado(s)</p>
                  )}
                </div>
                <div className="proprietario-card-actions">
                  <button type="button" onClick={() => navigate(`/proprietarios/${p.id}/editar`)}>Editar</button>
                  <button type="button" onClick={() => handleDelete(p)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
