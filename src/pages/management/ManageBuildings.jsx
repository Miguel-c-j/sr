import { useState, useEffect } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSearch,
  FaBuilding,
  FaMapMarkerAlt
} from 'react-icons/fa';
import '../../styles/management.css';

const ManageBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBuilding, setNewBuilding] = useState({ name: '', address: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({ name: '', address: '' });

  // Mock data
  useEffect(() => {
    const mockBuildings = [
      { id: 1, name: 'Colégio do Espírito Santo', address: 'Largo dos Colegiais, 2', roomCount: 12 },
      { id: 2, name: 'Colégio Mateus de Aranda', address: 'Rua da Universidade, 1', roomCount: 8 },
      { id: 3, name: 'Pólo da Mitra', address: 'Estrada da Mitra', roomCount: 5 },
      { id: 4, name: 'Complexo Desportivo', address: 'Avenida da Universidade', roomCount: 3 },
      { id: 5, name: 'Biblioteca Central', address: 'Largo dos Colegiais, 10', roomCount: 6 }
    ];
    setBuildings(mockBuildings);
    setFilteredBuildings(mockBuildings);
  }, []);

  // Filter buildings based on search
  useEffect(() => {
    const filtered = buildings.filter(b =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBuildings(filtered);
  }, [searchTerm, buildings]);

  // Add new building
  const handleAddBuilding = () => {
    if (!newBuilding.name.trim()) {
      alert('Por favor, insira o nome do edifício.');
      return;
    }

    if (!newBuilding.address.trim()) {
      alert('Por favor, insira a morada do edifício.');
      return;
    }

    // Check for duplicate name
    if (buildings.some(b => b.name.toLowerCase() === newBuilding.name.trim().toLowerCase())) {
      alert('Este edifício já existe no sistema.');
      return;
    }

    const buildingToAdd = {
      id: Math.max(...buildings.map(b => b.id), 0) + 1,
      name: newBuilding.name.trim(),
      address: newBuilding.address.trim(),
      roomCount: 0
    };

    setBuildings([...buildings, buildingToAdd]);
    setNewBuilding({ name: '', address: '' });
    setShowAddForm(false);
    alert('Edifício adicionado com sucesso!');
  };

  // Start editing building
  const startEditing = (building) => {
    setEditingId(building.id);
    setEditingData({ name: building.name, address: building.address });
  };

  // Save edited building
  const saveEditing = (id) => {
    if (!editingData.name.trim()) {
      alert('O nome do edifício não pode estar vazio.');
      return;
    }

    if (!editingData.address.trim()) {
      alert('A morada do edifício não pode estar vazia.');
      return;
    }

    // Check for duplicate name (excluding current)
    if (buildings.some(b => b.id !== id && b.name.toLowerCase() === editingData.name.trim().toLowerCase())) {
      alert('Este edifício já existe no sistema.');
      return;
    }

    setBuildings(prev => prev.map(b =>
      b.id === id ? { ...b, name: editingData.name.trim(), address: editingData.address.trim() } : b
    ));
    setEditingId(null);
    alert('Edifício atualizado com sucesso!');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
  };

  // Delete building
  const handleDeleteBuilding = (building) => {
    if (building.roomCount > 0) {
      alert(`Não é possível eliminar "${building.name}" pois existem ${building.roomCount} sala(s) associadas. Primeiro, elimine ou mova as salas deste edifício.`);
      return;
    }

    if (window.confirm(`Tem certeza que deseja eliminar "${building.name}"? Esta ação não pode ser desfeita.`)) {
      setBuildings(prev => prev.filter(b => b.id !== building.id));
      alert('Edifício eliminado com sucesso!');
    }
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <h2>Gerir Edifícios</h2>
          <p className="page-description">Adicionar e gerir edifícios da universidade</p>
        </div>
        <button className="btn-add-main" onClick={() => setShowAddForm(true)}>
          <FaPlus /> Adicionar Edifício
        </button>
      </div>

      <div className="management-container buildings-management">
        {/* Search Bar */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou morada..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Add Building Modal */}
        {showAddForm && (
          <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Adicionar Novo Edifício</h3>
                <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nome do Edifício *</label>
                  <input
                    type="text"
                    value={newBuilding.name}
                    onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                    placeholder="Ex: Edifício Central, Biblioteca, etc."
                    className="management-input"
                  />
                </div>
                <div className="form-group">
                  <label>Morada *</label>
                  <input
                    type="text"
                    value={newBuilding.address}
                    onChange={(e) => setNewBuilding({ ...newBuilding, address: e.target.value })}
                    placeholder="Ex: Av. da Universidade, 1"
                    className="management-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </button>
                <button className="btn-confirm" onClick={handleAddBuilding}>
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buildings Table */}
        <div className="buildings-table-container">
          <table className="management-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome do Edifício</th>
                <th>Morada</th>
                <th>Salas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuildings.map((building, index) => (
                <tr key={building.id}>
                  <td>{index + 1}</td>
                  <td className="building-name-cell">
                    {editingId === building.id ? (
                      <input
                        type="text"
                        value={editingData.name}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        className="edit-input"
                        autoFocus
                      />
                    ) : (
                      <div className="building-display">
                        <FaBuilding className="building-icon" />
                        <span>{building.name}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === building.id ? (
                      <input
                        type="text"
                        value={editingData.address}
                        onChange={(e) => setEditingData({ ...editingData, address: e.target.value })}
                        className="edit-input"
                      />
                    ) : (
                      <div className="address-display">
                        <FaMapMarkerAlt className="address-icon" />
                        <span>{building.address}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="room-count-badge">
                      {building.roomCount} {building.roomCount === 1 ? 'sala' : 'salas'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {editingId === building.id ? (
                      <>
                        <button className="btn-save-small" onClick={() => saveEditing(building.id)}>
                          <FaSave />
                        </button>
                        <button className="btn-cancel-small" onClick={cancelEditing}>
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-edit-small" onClick={() => startEditing(building)}>
                          <FaEdit />
                        </button>
                        <button className="btn-delete-small" onClick={() => handleDeleteBuilding(building)}>
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBuildings.length === 0 && (
            <div className="empty-state-small">
              <p>Nenhum edifício encontrado.</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="buildings-stats">
          <div className="stat-card">
            <span className="stat-label">Total de Edifícios:</span>
            <span className="stat-value">{buildings.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total de Salas:</span>
            <span className="stat-value">
              {buildings.reduce((sum, b) => sum + b.roomCount, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBuildings;