import AppLayout from '../components/AppLayout';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="dashboard-page">
        <h1>Início</h1>
        <p className="lead">Visão geral do seu painel</p>
        <div className="dashboard-welcome">
          <p>Você está logado. Em breve: pipeline de leads, imóveis e tarefas.</p>
          <p>Use o menu ao lado para navegar (novas seções serão adicionadas conforme o projeto avança).</p>
        </div>
      </div>
    </AppLayout>
  );
}
