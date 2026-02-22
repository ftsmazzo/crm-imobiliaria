import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom';
import { isLoggedIn } from './auth';
import Contatos from './pages/Contatos';
import Dashboard from './pages/Dashboard';
import Imoveis from './pages/Imoveis';
import Login from './pages/Login';
import Pipeline from './pages/Pipeline';
import Tarefas from './pages/Tarefas';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/pipeline" element={<PrivateRoute><Pipeline /></PrivateRoute>} />
        <Route path="/contatos" element={<PrivateRoute><Contatos /></PrivateRoute>} />
        <Route path="/imoveis" element={<PrivateRoute><Imoveis /></PrivateRoute>} />
        <Route path="/tarefas" element={<PrivateRoute><Tarefas /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
