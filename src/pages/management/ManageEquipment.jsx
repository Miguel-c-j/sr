import { useState, useEffect, useMemo } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaSearch
} from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/management.css';

const ManageEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Estado para o modal
  const [showModal, setShowModal] = useState(false);
  const [newEquipmentName, setNewEquipmentName] = useState('');

  // Carregar equipamentos
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await api.getEquipment();
        setEquipment(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
      }
    };
    fetchEquipment();
  }, []);

  // Lista filtrada pela pesquisa (derivada de equipment + searchTerm)
  const filteredEquipment = useMemo(
    () => equipment.filter(eq =>
      eq.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [equipment, searchTerm]
  );

  // Open modal
  const handleOpenModal = () => {
    setNewEquipmentName('');
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setNewEquipmentName('');
  };

  // Add new equipment
  const handleAddEquipment = async () => {
    if (!newEquipmentName.trim()) {
      alert('Por favor, insira o nome do equipamento.');
      return;
    }

    // Check for duplicates
    if (equipment.some(eq => eq.name.toLowerCase() === newEquipmentName.trim().toLowerCase())) {
      alert('Este equipamento já existe no sistema.');
      return;
    }

    try {
      const created = await api.createEquipment({ name: newEquipmentName.trim() });
      if (created?.id) {
        setEquipment(prev => [...prev, created]);
        handleCloseModal();
        alert('Equipamento adicionado com sucesso!');
      } else {
        alert('Não foi possível adicionar o equipamento.');
      }
    } catch (error) {
      console.error('Erro ao adicionar equipamento:', error);
      alert('Erro ao adicionar equipamento.');
    }
  };

  // Start editing equipment
  const startEditing = (eq) => {
    setEditingId(eq.id);
    setEditingName(eq.name);
  };

  // Save edited equipment
  const saveEditing = async () => {
    if (!editingName.trim()) {
      alert('O nome do equipamento não pode estar vazio.');
      return;
    }

    // Check for duplicates (excluding current item)
    if (equipment.some(eq => eq.id !== editingId && eq.name.toLowerCase() === editingName.trim().toLowerCase())) {
      alert('Este equipamento já existe no sistema.');
      return;
    }

    try {
      const updated = await api.updateEquipment(editingId, { name: editingName.trim() });
      if (updated?.id) {
        setEquipment(prev => prev.map(eq => (eq.id === editingId ? { ...eq, ...updated } : eq)));
        setEditingId(null);
        setEditingName('');
        alert('Equipamento atualizado com sucesso!');
      } else {
        alert('Não foi possível atualizar o equipamento.');
      }
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      alert('Erro ao atualizar equipamento.');
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
  };

  // Delete equipment
  const handleDeleteEquipment = async (eq) => {
    // Check if equipment is used in any room
    const isUsed = eq.usageCount > 0;

    if (isUsed) {
      alert(`Não é possível eliminar "${eq.name}" pois está associado a ${eq.usageCount} sala(s).`);
      return;
    }

    if (window.confirm(`Tem certeza que deseja eliminar "${eq.name}"?`)) {
      try {
        const ok = await api.deleteEquipment(eq.id);
        if (ok) {
          setEquipment(prev => prev.filter(e => e.id !== eq.id));
          alert('Equipamento eliminado com sucesso!');
        } else {
          alert('Não foi possível eliminar o equipamento.');
        }
      } catch (error) {
        console.error('Erro ao eliminar equipamento:', error);
        alert('Erro ao eliminar equipamento.');
      }
    }
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <h2>Gerir Equipamentos</h2>
          <p className="page-description">Adicionar, editar e gerir equipamentos disponíveis</p>
        </div>
        <div className="header-actions">
          <button className="btn-header btn-add" onClick={handleOpenModal}>
            <FaPlus /> Adicionar
          </button>
        </div>
      </div>

      <div className="management-container equipment-management">
        {/* Search Bar */}
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar por nome do equipamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Equipment List */}
        <div className="equipment-list">
          <table className="management-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Equipamento</th>
                <th>Utilizações</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquipment.map((eq, index) => (
                <tr key={eq.id}>
                  <td>{index + 1}</td>
                  <td className="equipment-name-cell">
                    {editingId === eq.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="edit-input"
                        autoFocus
                      />
                    ) : (
                      <div className="equipment-display">
                        <span className="equipment-icon">{eq.icon}</span>
                        <span>{eq.name}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="usage-badge">{eq.usageCount} salas</span>
                  </td>
                  <td className="actions-cell">
                    {editingId === eq.id ? (
                      <>
                        <button className="btn-save-small" onClick={saveEditing}>
                          <FaSave />
                        </button>
                        <button className="btn-cancel-small" onClick={cancelEditing}>
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-edit-small" onClick={() => startEditing(eq)}>
                          <FaEdit />
                        </button>
                        <button className="btn-delete-small" onClick={() => handleDeleteEquipment(eq)}>
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEquipment.length === 0 && (
            <div className="empty-state-small">
              <p>Nenhum equipamento encontrado.</p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="equipment-stats">
          <div className="stat-card">
            <span className="stat-label">Total de Equipamentos:</span>
            <span className="stat-value">{equipment.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Equipamentos mais utilizado:</span>
            <span className="stat-value">
              {equipment.length > 0 &&
                equipment.reduce((max, eq) => eq.usageCount > max.usageCount ? eq : max, equipment[0])?.name
              }
            </span>
          </div>
        </div>
      </div>

      {/* Modal para adicionar equipamento */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adicionar Novo Equipamento</h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome do Equipamento *</label>
                <input
                  type="text"
                  value={newEquipmentName}
                  onChange={(e) => setNewEquipmentName(e.target.value)}
                  placeholder="Ex: Projetor, Quadro Branco, etc."
                  className="management-input"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEquipment()}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleCloseModal}>
                Cancelar
              </button>
              <button className="btn-confirm" onClick={handleAddEquipment}>
                <FaPlus /> Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEquipment;