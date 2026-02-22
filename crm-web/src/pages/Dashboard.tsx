import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../api';
import type { DashboardStats } from '../api';
import { getUser } from '../auth';
import AppLayout from '../components/AppLayout';
import './Dashboard.css';

const ESTAGIOS: { key: string; label: string }[] = [
  { key: 'novo', label: 'Novo' },
  { key: 'qualificado', label: 'Qualificado' },
  { key: 'visita', label: 'Visita' },
  { key: 'proposta', label: 'Proposta' },
  { key: 'fechado', label: 'Fechado' },
];

const STATUS_IMOVEIS: { key: string; label: string }[] = [
  { key: 'disponivel', label: 'Disponível' },
  { key: 'reservado', label: 'Reservado' },
  { key: 'vendido', label: 'Vendido' },
  { key: 'alugado', label: 'Alugado' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const user = getUser();

  useEffect(() => {
    let cancelled = false;
    getDashboardStats()
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
  }, []);

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

        {stats && stats.novosLeads > 0 && (
          <div className="dashboard-novos-leads">
            <Link to="/pipeline?estagio=novo">
              <strong>{stats.novosLeads}</strong> novo(s) lead(s) — clique para ver
            </Link>
          </div>
        )}

        {stats && (
          <div className="dashboard-grid">
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
