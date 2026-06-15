// src/components/Layout/Header.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import api from '../../services/api';

const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    api.logout(); // remove tokens e user
    navigate('/login');
    setShowUserMenu(false);
  };

  const getRoleIcon = (role) => {
    const icons = {
      convidado: '👤',
      aluno: '🎓',
      docente: '👨‍🏫',
      secretariado: '📋',
      administrador: '⚙️'
    };
    return icons[role] || '👤';
  };

  const getRoleLabel = (role) => {
    const labels = {
      convidado: 'Convidado',
      aluno: 'Aluno',
      docente: 'Docente',
      secretariado: 'Secretariado',
      administrador: 'Administrador'
    };
    return labels[role] || 'Utilizador';
  };

  if (!userData) {
    return (
      <header className="header">
        <button className="menu-button" onClick={onMenuClick}>
          <FaBars size={24} />
        </button>
        <div className="header-title">
          <h1>Sistema de Reservas</h1>
          <p>Universidade de Évora</p>
        </div>
        <div className="header-user">
          <button className="login-btn" onClick={() => navigate('/login')}>
            <FaUser /> Entrar
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <button className="menu-button" onClick={onMenuClick}>
        <FaBars size={24} />
      </button>

      <div className="header-title">
        <h1>Sistema de Reservas</h1>
        <p>Universidade de Évora</p>
      </div>

      <div className="header-user">
        <div className="user-info-container">
          <div
            className="user-info"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              <span className="user-icon">{getRoleIcon(userData.role)}</span>
            </div>
            <div className="user-details">
              <div className="user-name">{userData.name}</div>
              <div className="user-role">{getRoleLabel(userData.role)}</div>
            </div>
            <FaChevronDown className={`user-dropdown-icon ${showUserMenu ? 'open' : ''}`} />
          </div>

          {showUserMenu && (
            <div className="user-menu">
              <div className="user-menu-header">
                <div className="user-menu-avatar">
                  <span>{getRoleIcon(userData.role)}</span>
                </div>
                <div className="user-menu-info">
                  <div className="user-menu-name">{userData.name}</div>
                  <div className="user-menu-email">{userData.email}</div>
                  <div className="user-menu-role">{getRoleLabel(userData.role)}</div>
                </div>
              </div>
              <div className="user-menu-divider"></div>
              <button className="user-menu-item logout" onClick={handleLogout}>
                <FaSignOutAlt />
                <span>Terminar Sessão</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;