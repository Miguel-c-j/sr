import { useState, useEffect } from 'react';
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaGraduationCap,
  FaShieldAlt,
  FaCheck,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserTie,
  FaUserCog
} from 'react-icons/fa';
import '../../styles/management.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState(null);
  const [currentAdminId, setCurrentAdminId] = useState(1); // Simulated current admin ID

  // Estado para o modal de eliminação
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Definição dos perfis disponíveis
  const profileTypes = [
    { id: 'aluno', label: 'Aluno', icon: '🎓', description: 'Pode reservar salas', level: 1, color: '#ffc107' },
    { id: 'docente', label: 'Docente', icon: '👨‍🏫', description: 'Prioridade nas reservas', level: 2, color: '#28a745' },
    { id: 'secretariado', label: 'Secretariado', icon: '📋', description: 'Aprova reservas e gere conflitos', level: 3, color: '#17a2b8' },
    { id: 'administrador', label: 'Administrador', icon: '⚙️', description: 'Acesso total ao sistema', level: 4, color: '#dc3545' }
  ];

  // Mock data
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        name: 'Prof. João Silva',
        email: 'joao.silva@uevora.pt',
        profiles: ['administrador'],
        department: 'Engenharia Informática',
        buildingAccess: ['all']
      },
      {
        id: 2,
        name: 'Prof. Maria Santos',
        email: 'maria.santos@uevora.pt',
        profiles: ['secretariado'],
        department: 'Secretariado Académico',
        buildingAccess: [1, 2, 3]
      },
      {
        id: 3,
        name: 'Ana Costa',
        email: 'ana.costa@uevora.pt',
        profiles: ['docente'],
        department: 'Matemática',
        buildingAccess: []
      },
      {
        id: 4,
        name: 'Carlos Ferreira',
        email: 'carlos.ferreira@uevora.pt',
        profiles: ['aluno'],
        department: 'Engenharia Informática',
        buildingAccess: []
      },
      {
        id: 5,
        name: 'Dra. Teresa Rodrigues',
        email: 'teresa.rodrigues@uevora.pt',
        profiles: ['secretariado', 'docente'],
        department: 'Secretariado de Ciências',
        buildingAccess: [1, 2]
      },
      {
        id: 6,
        name: 'Prof. António Mendes',
        email: 'antonio.mendes@uevora.pt',
        profiles: ['docente', 'secretariado'],
        department: 'Física',
        buildingAccess: [3, 4]
      },
      {
        id: 7,
        name: 'Super Admin',
        email: 'admin@uevora.pt',
        profiles: ['administrador', 'secretariado', 'docente'],
        department: 'Administração',
        buildingAccess: ['all']
      }
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  // Filter users based on search
  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const buildings = [
    { id: 1, name: 'Colégio do Espírito Santo' },
    { id: 2, name: 'Colégio Mateus de Aranda' },
    { id: 3, name: 'Pólo da Mitra' },
    { id: 4, name: 'Complexo Desportivo' }
  ];

  // Obter o level máximo do utilizador para determinar o perfil principal
  const getMaxProfileLevel = (profiles) => {
    let maxLevel = 0;
    profiles.forEach(profileId => {
      const profile = profileTypes.find(p => p.id === profileId);
      if (profile && profile.level > maxLevel) {
        maxLevel = profile.level;
      }
    });
    return maxLevel;
  };

  const getPrimaryRole = (profiles) => {
    const maxLevel = getMaxProfileLevel(profiles);
    const primaryProfile = profileTypes.find(p => p.level === maxLevel);
    return primaryProfile ? primaryProfile.id : 'aluno';
  };

  const getRoleIcon = (profiles) => {
    const primaryRole = getPrimaryRole(profiles);
    const profile = profileTypes.find(p => p.id === primaryRole);
    return profile ? profile.icon : '👤';
  };

  const getRoleLabel = (profiles) => {
    const labels = [];
    profiles.forEach(profileId => {
      const profile = profileTypes.find(p => p.id === profileId);
      if (profile) labels.push(profile.label);
    });
    return labels.join(', ');
  };

  const startEditing = (user) => {
    setEditingId(user.id);
    setEditingPermissions({
      profiles: [...user.profiles],
      buildingAccess: [...user.buildingAccess]
    });
  };

  const saveEditing = () => {
    // Prevent admin from removing their own admin profile
    if (editingId === currentAdminId && !editingPermissions.profiles.includes('administrador')) {
      alert('Não pode remover as suas próprias permissões de administrador.');
      return;
    }

    setUsers(prev => prev.map(user =>
      user.id === editingId
        ? {
            ...user,
            profiles: [...editingPermissions.profiles],
            buildingAccess: [...editingPermissions.buildingAccess]
          }
        : user
    ));
    setEditingId(null);
    alert('Permissões atualizadas com sucesso!');
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleProfileToggle = (profileId) => {
    setEditingPermissions(prev => ({
      ...prev,
      profiles: prev.profiles.includes(profileId)
        ? prev.profiles.filter(p => p !== profileId)
        : [...prev.profiles, profileId]
    }));
  };

  const handleBuildingAccessChange = (buildingId) => {
    setEditingPermissions(prev => ({
      ...prev,
      buildingAccess: prev.buildingAccess.includes(buildingId)
        ? prev.buildingAccess.filter(id => id !== buildingId)
        : [...prev.buildingAccess, buildingId]
    }));
  };

  // Verificar se o utilizador tem um determinado perfil
  const hasProfile = (profiles, profileId) => {
    return profiles.includes(profileId);
  };

  // Abrir modal de confirmação para eliminar
  const openDeleteModal = (user) => {
    // Não permitir eliminar o próprio admin
    if (user.id === currentAdminId) {
      alert('Não pode eliminar a sua própria conta de administrador.');
      return;
    }
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Confirmar eliminação
  const confirmDelete = () => {
    setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
    setShowDeleteModal(false);
    setUserToDelete(null);
    alert('Utilizador eliminado com sucesso!');
  };

  // Cancelar eliminação
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <h2>Gerir Utilizadores</h2>
          <p className="page-description">Atribuir múltiplos perfis a cada utilizador</p>
        </div>
      </div>

      <div className="management-container users-management">
        {/* Search Bar */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <div className="table-responsive">
            <table className="management-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfis</th>
                  <th>Departamento</th>
                  <th>Acesso Edifícios</th>
                  <th>Ações</th>
              </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className={user.id === currentAdminId ? 'current-admin' : ''}>
                    <td className="user-name-cell">
                      <div className="user-display">
                        <FaUser className="user-icon" />
                        <span>{user.name}</span>
                        {user.id === currentAdminId && <span className="admin-badge">(Você)</span>}
                      </div>
                    </td>
                    <td>
                      <div className="email-display">
                        <FaEnvelope className="email-icon" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="profiles-cell">
                      {editingId === user.id ? (
                        <div className="profiles-editor">
                          <div className="profiles-checkboxes">
                            {profileTypes.map(profile => (
                              <label
                                key={profile.id}
                                className={`profile-checkbox ${editingPermissions.profiles.includes(profile.id) ? 'checked' : ''}`}
                                style={{ borderColor: profile.color }}
                              >
                                <input
                                  type="checkbox"
                                  checked={editingPermissions.profiles.includes(profile.id)}
                                  onChange={() => handleProfileToggle(profile.id)}
                                  disabled={user.id === currentAdminId && profile.id === 'administrador'}
                                />
                                <span className="profile-icon">{profile.icon}</span>
                                <div className="profile-info">
                                  <span className="profile-label">{profile.label}</span>
                                  <small className="profile-desc">{profile.description}</small>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="profiles-display">
                          {profileTypes.map(profile => (
                            hasProfile(user.profiles, profile.id) && (
                              <span
                                key={profile.id}
                                className="profile-badge"
                                style={{ background: profile.color }}
                              >
                                <span className="profile-badge-icon">{profile.icon}</span>
                                <span>{profile.label}</span>
                              </span>
                            )
                          ))}
                          {user.profiles.length === 0 && (
                            <span className="no-profiles">Sem permissões</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="department-display">
                        <FaGraduationCap className="department-icon" />
                        <span>{user.department}</span>
                      </div>
                    </td>
                    <td className="building-access-cell">
                      {editingId === user.id && editingPermissions.profiles.includes('secretariado') ? (
                        <div className="building-selector">
                          <FaBuilding className="building-icon" />
                          <div className="building-checkboxes">
                            <label className="building-checkbox">
                              <input
                                type="checkbox"
                                checked={editingPermissions.buildingAccess.includes('all')}
                                onChange={() => {
                                  if (editingPermissions.buildingAccess.includes('all')) {
                                    setEditingPermissions(prev => ({
                                      ...prev,
                                      buildingAccess: []
                                    }));
                                  } else {
                                    setEditingPermissions(prev => ({
                                      ...prev,
                                      buildingAccess: ['all']
                                    }));
                                  }
                                }}
                              />
                              Todos os edifícios
                            </label>
                            {buildings.map(building => (
                              <label key={building.id} className="building-checkbox">
                                <input
                                  type="checkbox"
                                  checked={editingPermissions.buildingAccess.includes(building.id)}
                                  onChange={() => handleBuildingAccessChange(building.id)}
                                  disabled={editingPermissions.buildingAccess.includes('all')}
                                />
                                {building.name}
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="building-access-display">
                          {user.buildingAccess.length === 0 && <span className="no-access">—</span>}
                          {user.buildingAccess.includes('all') && <span className="access-badge">Todos os edifícios</span>}
                          {!user.buildingAccess.includes('all') && user.buildingAccess.map(bId => {
                            const building = buildings.find(b => b.id === bId);
                            return building ? (
                              <span key={bId} className="access-badge">{building.name}</span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </td>
                    <td className="actions-cell">
                      {editingId === user.id ? (
                        <>
                          <button className="btn-save-small" onClick={saveEditing} title="Guardar">
                            <FaSave />
                          </button>
                          <button className="btn-cancel-small" onClick={cancelEditing} title="Cancelar">
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="btn-edit-small" onClick={() => startEditing(user)} title="Editar Perfis">
                            <FaEdit />
                          </button>
                          <button
                            className="btn-delete-small"
                            onClick={() => openDeleteModal(user)}
                            title="Eliminar Utilizador"
                            disabled={user.id === currentAdminId}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="empty-state-small">
              <p>Nenhum utilizador encontrado.</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="users-stats">
          <div className="stat-card">
            <span className="stat-label">Total de Utilizadores:</span>
            <span className="stat-value">{users.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Administradores:</span>
            <span className="stat-value">{users.filter(u => u.profiles.includes('administrador')).length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Secretariado:</span>
            <span className="stat-value">{users.filter(u => u.profiles.includes('secretariado')).length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Docentes:</span>
            <span className="stat-value">{users.filter(u => u.profiles.includes('docente')).length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Alunos:</span>
            <span className="stat-value">{users.filter(u => u.profiles.includes('aluno')).length}</span>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de eliminação */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar Utilizador</h3>
              <button className="modal-close" onClick={cancelDelete}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>Tem certeza que deseja eliminar o utilizador <strong>{userToDelete.name}</strong>?</p>
              <p className="text-warning">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={cancelDelete}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={confirmDelete}>
                <FaTrash /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;