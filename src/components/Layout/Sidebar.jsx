// src/components/Layout/Sidebar.jsx
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTimes,
  FaChalkboard,
  FaCalendarAlt,
  FaClock,
  FaHistory,
  FaFileImport,
  FaBuilding,
  FaTools,
  FaUsers,
  FaUniversity
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const [menuSections, setMenuSections] = useState([]);

  useEffect(() => {
    // Obter dados do utilizador logado
    const userData = JSON.parse(localStorage.getItem('user'));
    const userRole = userData?.role || 'convidado';

    // Definir menus baseados no perfil
    const getMenusByRole = () => {
      switch (userRole) {
        case 'administrador':
          // Admin vê APENAS menus de gestão
          return [
            {
              title: "GESTÃO",
              items: [
                { path: "/gerir-salas", label: "Gerir Salas", icon: <FaBuilding /> },
                { path: "/gerir-equipamentos", label: "Gerir Equipamentos", icon: <FaTools /> },
                { path: "/gerir-edificios", label: "Gerir Edifícios", icon: <FaUniversity /> },
                { path: "/gerir-utilizadores", label: "Gerir Utilizadores", icon: <FaUsers /> }
              ]
            }
          ];

        case 'secretariado':
          // Secretariado vê APENAS menus de secretariado
          return [
            {
              title: "SECRETARIADO",
              items: [
                { path: "/pendentes", label: "Pendentes", icon: <FaClock /> },
                { path: "/historico", label: "Histórico", icon: <FaHistory /> },
                { path: "/importar", label: "Importar", icon: <FaFileImport /> }
              ]
            }
          ];

        case 'docente':
        case 'aluno':
          // Aluno e Docente vêem apenas Salas e Reservas
          return [
            {
              title: "PRINCIPAL",
              items: [
                { path: "/salas", label: "Salas", icon: <FaChalkboard /> },
                { path: "/reservas", label: "Minhas Reservas", icon: <FaCalendarAlt /> }
              ]
            }
          ];

        case 'convidado':
        default:
          // Convidado vê apenas Salas
          return [
            {
              title: "PRINCIPAL",
              items: [
                { path: "/salas", label: "Salas", icon: <FaChalkboard /> }
              ]
            }
          ];
      }
    };

    setMenuSections(getMenusByRole());
  }, []);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuSections.map((section, idx) => (
            <div key={idx} className="sidebar-section">
              <h3 className="section-title">{section.title}</h3>
              <ul className="section-items">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;