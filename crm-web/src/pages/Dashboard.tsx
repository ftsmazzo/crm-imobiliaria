import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth } from '../auth';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();

  function handleSair() {
    clearAuth();
    navigate('/login', { replace: true });
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>CRM Imobiliário</h1>
        <div style={styles.userRow}>
          <span style={styles.user}>Bem-vindo, {user?.nome ?? ''}</span>
          <button type="button" onClick={handleSair} style={styles.sair}>
            Sair
          </button>
        </div>
      </header>
      <main style={styles.main}>
        <p style={styles.msg}>Você está logado. Em breve: pipeline, leads e imóveis.</p>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', fontFamily: 'sans-serif' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    background: '#001529',
    color: '#fff',
  },
  title: { margin: 0, fontSize: '1.25rem' },
  userRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  user: { fontSize: '0.9rem' },
  sair: {
    padding: '0.4rem 0.75rem',
    background: 'transparent',
    color: '#fff',
    border: '1px solid #fff',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  main: { padding: '1.5rem' },
  msg: { color: '#666' },
};
