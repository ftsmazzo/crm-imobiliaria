import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../auth';
import './AppLayout.css';

type AppLayoutProps = { children: React.ReactNode };

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleSair() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="app-layout">
      <div
        className={`app-sidebar-overlay ${sidebarOpen ? 'is-visible' : ''}`}
        onClick={closeSidebar}
        aria-hidden
      />
      <div className="app-layout-body">
        <aside
          className={`app-sidebar ${sidebarOpen ? 'is-open' : 'is-closed'}`}
          role="navigation"
        >
          <div className="app-sidebar-logo">CRM Imobiliário</div>
          <nav className="app-sidebar-nav">
            <Link to="/" onClick={closeSidebar} className={location.pathname === '/' ? 'active' : ''}>
              Início
            </Link>
            <Link to="/pipeline" onClick={closeSidebar} className={location.pathname === '/pipeline' ? 'active' : ''}>
              Pipeline
            </Link>
            <Link to="/contatos" onClick={closeSidebar} className={location.pathname === '/contatos' ? 'active' : ''}>
              Contatos
            </Link>
            <Link to="/imoveis" onClick={closeSidebar} className={location.pathname === '/imoveis' ? 'active' : ''}>
              Imóveis
            </Link>
            <Link to="/tarefas" onClick={closeSidebar} className={location.pathname === '/tarefas' ? 'active' : ''}>
              Tarefas
            </Link>
          </nav>
        </aside>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header className="app-header">
            <button
              type="button"
              className="app-header-menu-btn"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Abrir menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="app-header-user">
              <span><strong>{user?.nome}</strong></span>
              <span>{user?.email}</span>
            </div>
            <button type="button" onClick={handleSair} className="app-header-sair">
              Sair
            </button>
          </header>
          <main className="app-main">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
