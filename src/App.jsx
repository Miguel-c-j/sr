// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import LoginPage from "./pages/LoginPage";
import ProfileSelect from "./pages/ProfileSelect";
import RoomsPage from "./pages/RoomsPage";
import ReservationsPage from "./pages/ReservationsPage";
import PendingRequests from "./pages/secretariat/PendingRequests";
import History from "./pages/secretariat/History";
import ImportData from "./pages/secretariat/ImportData";
import ManageRooms from "./pages/management/ManageRooms";
import ManageEquipment from "./pages/management/ManageEquipment";
import ManageBuildings from "./pages/management/ManageBuildings";
import ManageUsers from "./pages/management/ManageUsers";

// Componente para proteger rotas
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente para proteger rotas baseado no role
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userData = JSON.parse(user);

  if (!allowedRoles.includes(userData.role)) {
    // Redirecionar para a página padrão do utilizador
    const defaultPage = userData.defaultPage || '/salas';
    return <Navigate to={defaultPage} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública de login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Seleção de perfil (após login, quando há 2+ perfis) */}
        <Route path="/selecionar-perfil" element={
          <ProtectedRoute>
            <ProfileSelect />
          </ProtectedRoute>
        } />

        {/* Rotas de Aluno/Docente/Convidado */}
        <Route path="/salas" element={
          <ProtectedRoute>
            <Layout><RoomsPage /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/reservas" element={
          <RoleBasedRoute allowedRoles={['aluno', 'docente', 'administrador']}>
            <Layout><ReservationsPage /></Layout>
          </RoleBasedRoute>
        } />

        {/* Rotas da Secretaria - apenas secretariado e admin */}
        <Route path="/pendentes" element={
          <RoleBasedRoute allowedRoles={['secretariado', 'administrador']}>
            <Layout><PendingRequests /></Layout>
          </RoleBasedRoute>
        } />

        <Route path="/historico" element={
          <RoleBasedRoute allowedRoles={['secretariado', 'administrador']}>
            <Layout><History /></Layout>
          </RoleBasedRoute>
        } />

        <Route path="/importar" element={
          <RoleBasedRoute allowedRoles={['secretariado', 'administrador']}>
            <Layout><ImportData /></Layout>
          </RoleBasedRoute>
        } />

        {/* Rotas de Gestão - apenas administrador */}
        <Route path="/gerir-salas" element={
          <RoleBasedRoute allowedRoles={['administrador']}>
            <Layout><ManageRooms /></Layout>
          </RoleBasedRoute>
        } />

        <Route path="/gerir-equipamentos" element={
          <RoleBasedRoute allowedRoles={['administrador']}>
            <Layout><ManageEquipment /></Layout>
          </RoleBasedRoute>
        } />

        <Route path="/gerir-edificios" element={
          <RoleBasedRoute allowedRoles={['administrador']}>
            <Layout><ManageBuildings /></Layout>
          </RoleBasedRoute>
        } />

        <Route path="/gerir-utilizadores" element={
          <RoleBasedRoute allowedRoles={['administrador']}>
            <Layout><ManageUsers /></Layout>
          </RoleBasedRoute>
        } />

        {/* Rota padrão - redirecionar para a página correta baseada no perfil */}
        <Route path="/" element={
          <ProtectedRoute>
            {() => {
              const userData = JSON.parse(localStorage.getItem('user'));
              const defaultPage = userData?.defaultPage || '/salas';
              return <Navigate to={defaultPage} replace />;
            }}
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;