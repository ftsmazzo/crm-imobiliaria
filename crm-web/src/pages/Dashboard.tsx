import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api';
import type { DashboardStats } from '../api';
import { getUser } from '../auth';
import AppLayout from '../components/AppLayout';
import './Dashboard.css';

const ESTAGIOS: { key: string; label: string }[] = [
  { key: 'novo', label: 'Novo' },
  { key: 'lead', label: 'Lead' },
  { key: 'contato_inicial', label: 'Contato inicial' },
  { key: 'qualificado', label: 'Qualificado' },
  { key: 'visita', label: 'Visita' },
  { key: 'proposta', label: 'Proposta' },
  { key: 'fechado', label: 'Fechado' },
  { key: 'perdido', label: 'Perdido' },
  { key: 'perdido_remarketing', label: 'Perdido com remarketing' },
];

const STATUS_IMOVEIS: { key: string; label: string }[] = [
  { key: 'disponivel', label: 'Disponível' },
  { key: 'reservado', label: 'Reservado' },
  { key: 'vendido', label: 'Vendido' },
  { key: 'alugado', label: 'Alugado' },
];

function getMesAtual(): { dataInicio: string; dataFim: string } {
  const now = new Date();
  const dataFim = now.toISOString().slice(0, 10);
  const dataInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  return { dataInicio, dataFim };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [periodo, setPeriodo] = useState<{ dataInicio: string; dataFim: string }>(() => getMesAtual());
  const user = getUser();

  useEffect(() => {
    let cancelled = false;
    getDashboardStats({ dataInicio: periodo.dataInicio, dataFim: periodo.dataFim })
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((e) => {
        if (!cancelled) setErro(e instanceof Error ? e.message : 'Erro ao carregar');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [periodo.dataInicio, periodo.dataFim]);

  if (loading) {
    return (
      <AppLayout>
        <div className="dashboard-page">
          <h1>Início</h1>
          <p className="lead">Carregando…</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="dashboard-page">
        <h1>Início</h1>
        <p className="lead">
          {user?.role === 'gestor' ? 'Visão geral do painel' : 'Seu resumo'}
        </p>
        {erro && <p className="dashboard-erro">{erro}</p>}

        <div className="dashboard-periodo">
          <label>Período (leads e imóveis):</label>
          <input
            type="date"
            value={periodo.dataInicio}
            onChange={(e) => setPeriodo((p) => ({ ...p, dataInicio: e.target.value }))}
          />
          <span>até</span>
          <input
            type="date"
            value={periodo.dataFim}
            onChange={(e) => setPeriodo((p) => ({ ...p, dataFim: e.target.value }))}
          />
        </div>

        {stats && stats.novosLeads > 0 && (
          <div className="dashboard-novos-leads">
            <Link to="/pipeline?estagio=novo">
              <strong>{stats.novosLeads}</strong> novo(s) lead(s) — clique para ver
            </Link>
          </div>
        )}

        {stats && (
          <div className="dashboard-grid">
            {stats.leadsNoPeriodo !== undefined && stats.imoveisNoPeriodo !== undefined && (
              <>
                <section className="dashboard-card">
                  <h2>Leads no período</h2>
                  <p className="dashboard-number">{stats.leadsNoPeriodo}</p>
                  <p className="dashboard-hint">Contatos criados entre {periodo.dataInicio} e {periodo.dataFim}</p>
                </section>
                <section className="dashboard-card">
                  <h2>Imóveis no período</h2>
                  <p className="dashboard-number">{stats.imoveisNoPeriodo}</p>
                  <p className="dashboard-hint">Imóveis cadastrados entre {periodo.dataInicio} e {periodo.dataFim}</p>
                </section>
              </>
            )}
            <section className="dashboard-card dashboard-card-funil">
              <h2>Leads por estágio</h2>
              <ul className="dashboard-funil-list">
                {ESTAGIOS.map(({ key, label }) => (
                  <li key={key}>
                    <span className="dashboard-funil-label">{label}</span>
                    <span className="dashboard-funil-value">{stats.contatosPorEstagio[key] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="dashboard-card">
              <h2>Tarefas atrasadas</h2>
              <p className="dashboard-number">
                <Link to="/tarefas">{stats.tarefasAtrasadas}</Link>
              </p>
              <p className="dashboard-hint">Clique para abrir a lista de tarefas</p>
            </section>

            <section className="dashboard-card dashboard-card-imoveis">
              <h2>Imóveis por status</h2>
              <ul className="dashboard-status-list">
                {STATUS_IMOVEIS.map(({ key, label }) => (
                  <li key={key}>
                    <span className="dashboard-status-label">{label}</span>
                    <span className="dashboard-status-value">{stats.imoveisPorStatus[key] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
