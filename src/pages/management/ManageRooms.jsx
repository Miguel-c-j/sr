import { useState, useEffect } from 'react';
import {
  FaTrash,
  FaPlus,
  FaBuilding,
  FaUsers,
  FaEdit,
  FaTimes,
  FaCheck,
  FaSave
} from 'react-icons/fa';
import '../../styles/management.css';

const ManageRooms = () => {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Estado para controlar qual ação está ativa
  const [activeAction, setActiveAction] = useState(null); // 'create', 'edit', 'delete'

  // Estado para o formulário de criar
  const [createFormData, setCreateFormData] = useState({
    name: '',
    capacity: '',
    buildingId: '',
    type: 'aula',
    equipment: []
  });

  // Estado para seleção de edifício/sala (alterar e eliminar)
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Estado para o formulário de editar
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    capacity: '',
    buildingId: '',
    type: 'aula',
    equipment: []
  });

  // Mock data
  useEffect(() => {
    const mockBuildings = [
      { id: 1, name: 'Colégio do Espírito Santo', address: 'Largo dos Colegiais, 2' },
      { id: 2, name: 'Colégio Mateus de Aranda', address: 'Rua da Universidade, 1' },
      { id: 3, name: 'Pólo da Mitra', address: 'Estrada da Mitra' },
      { id: 4, name: 'Complexo Desportivo', address: 'Avenida da Universidade' }
    ];

    const mockRooms = [
      { id: 1, name: 'Sala 101', capacity: 30, buildingId: 1, type: 'aula', equipment: ['projetor', 'quadro', 'wifi'] },
      { id: 2, name: 'Sala 102', capacity: 25, buildingId: 1, type: 'aula', equipment: ['quadro', 'wifi'] },
      { id: 3, name: 'Laboratório 202', capacity: 20, buildingId: 1, type: 'laboratorio', equipment: ['computadores', 'projetor', 'wifi'] },
      { id: 4, name: 'Sala de Reuniões 305', capacity: 15, buildingId: 2, type: 'reuniao', equipment: ['videoconferencia', 'wifi', 'quadro'] },
      { id: 5, name: 'Auditório', capacity: 150, buildingId: 4, type: 'aula', equipment: ['projetor', 'som', 'arcondicionado'] }
    ];

    setBuildings(mockBuildings);
    setRooms(mockRooms);
  }, []);

  const equipmentList = [
    { id: 'projetor', label: 'Projetor', icon: '📽️' },
    { id: 'quadro', label: 'Quadro Branco', icon: '📋' },
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'computadores', label: 'Computadores', icon: '💻' },
    { id: 'arcondicionado', label: 'Ar Condicionado', icon: '❄️' },
    { id: 'videoconferencia', label: 'Videoconferência', icon: '🎥' },
    { id: 'som', label: 'Sistema de Som', icon: '🔊' },
    { id: 'quadrointerativo', label: 'Quadro Interativo', icon: '🖥️' }
  ];

  const roomTypes = [
    { id: 'aula', label: 'Sala de Aula' },
    { id: 'laboratorio', label: 'Laboratório' },
    { id: 'reuniao', label: 'Sala de Reuniões' },
    { id: 'auditorio', label: 'Auditório' }
  ];

  // Filtrar salas por edifício selecionado
  const filteredRooms = rooms.filter(room => room.buildingId === parseInt(selectedBuildingId));

  // Handle criar
  const handleCreateClick = () => {
    setActiveAction('create');
    setSelectedBuildingId('');
    setSelectedRoomId('');
    setCreateFormData({
      name: '',
      capacity: '',
      buildingId: '',
      type: 'aula',
      equipment: []
    });
  };

  // Handle alterar
  const handleEditClick = () => {
    setActiveAction('edit');
    setSelectedBuildingId('');
    setSelectedRoomId('');
    setEditFormData({
      id: '',
      name: '',
      capacity: '',
      buildingId: '',
      type: 'aula',
      equipment: []
    });
  };

  // Handle eliminar
  const handleDeleteClick = () => {
    setActiveAction('delete');
    setSelectedBuildingId('');
    setSelectedRoomId('');
  };

  // Quando seleciona uma sala para editar, carrega os dados
  const handleRoomSelectForEdit = (roomId) => {
    const room = rooms.find(r => r.id === parseInt(roomId));
    if (room) {
      setSelectedRoomId(roomId);
      setEditFormData({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        buildingId: room.buildingId,
        type: room.type,
        equipment: [...room.equipment]
      });
    }
  };

  // Submeter criação
  const handleCreateSubmit = () => {
    if (!createFormData.name || !createFormData.capacity || !createFormData.buildingId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newRoom = {
      id: Math.max(...rooms.map(r => r.id), 0) + 1,
      name: createFormData.name,
      capacity: parseInt(createFormData.capacity),
      buildingId: parseInt(createFormData.buildingId),
      type: createFormData.type,
      equipment: [...createFormData.equipment]
    };

    setRooms(prev => [...prev, newRoom]);
    alert('Sala criada com sucesso!');
    setActiveAction(null);
  };

  // Submeter edição
  const handleEditSubmit = () => {
    if (!editFormData.name || !editFormData.capacity || !editFormData.buildingId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setRooms(prev => prev.map(room =>
      room.id === editFormData.id
        ? {
            ...room,
            name: editFormData.name,
            capacity: parseInt(editFormData.capacity),
            buildingId: editFormData.buildingId,
            type: editFormData.type,
            equipment: [...editFormData.equipment]
          }
        : room
    ));
    alert('Sala atualizada com sucesso!');
    setActiveAction(null);
    setSelectedBuildingId('');
    setSelectedRoomId('');
  };

  // Eliminar sala
  const handleDeleteSubmit = () => {
    if (!selectedRoomId) {
      alert('Por favor, selecione uma sala para eliminar.');
      return;
    }

    const hasReservations = false; // TODO: Check with API

    if (hasReservations) {
      alert('Não é possível eliminar esta sala pois existem reservas futuras associadas.');
      return;
    }

    if (window.confirm('Tem certeza que deseja eliminar esta sala? Esta ação não pode ser desfeita.')) {
      setRooms(prev => prev.filter(room => room.id !== parseInt(selectedRoomId)));
      alert('Sala eliminada com sucesso!');
      setActiveAction(null);
      setSelectedBuildingId('');
      setSelectedRoomId('');
    }
  };

  // Cancelar ação
  const handleCancel = () => {
    setActiveAction(null);
    setSelectedBuildingId('');
    setSelectedRoomId('');
  };

  // Atualizar campos do formulário de criar
  const handleCreateInputChange = (field, value) => {
    setCreateFormData(prev => ({ ...prev, [field]: value }));
  };

  // Alternar equipamento no formulário de criar
  const toggleCreateEquipment = (equipmentId) => {
    setCreateFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentId)
        ? prev.equipment.filter(e => e !== equipmentId)
        : [...prev.equipment, equipmentId]
    }));
  };

  // Alternar equipamento no formulário de editar
  const toggleEditEquipment = (equipmentId) => {
    setEditFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipmentId)
        ? prev.equipment.filter(e => e !== equipmentId)
        : [...prev.equipment, equipmentId]
    }));
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <div>
          <h2>Gerir Salas</h2>
          <p className="page-description">Adicionar, editar e gerir salas do sistema</p>
        </div>
        <div className="header-actions">
          <button className={`btn-header btn-create ${activeAction === 'create' ? 'active' : ''}`} onClick={handleCreateClick}>
            <FaPlus /> Criar
          </button>
          <button className={`btn-header btn-edit ${activeAction === 'edit' ? 'active' : ''}`} onClick={handleEditClick}>
            <FaEdit /> Alterar
          </button>
          <button className={`btn-header btn-delete ${activeAction === 'delete' ? 'active' : ''}`} onClick={handleDeleteClick}>
            <FaTrash /> Eliminar
          </button>
        </div>
      </div>

      <div className="management-container rooms-management">

        {/* ========== FORMULÁRIO DE CRIAR ========== */}
        {activeAction === 'create' && (
          <div className="action-panel">
            <h3>Criar Nova Sala</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome da Sala *</label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => handleCreateInputChange('name', e.target.value)}
                  placeholder="Ex: Sala 101, Auditório, etc."
                  className="management-input"
                />
              </div>

              <div className="form-group">
                <label>Edifício *</label>
                <select
                  value={createFormData.buildingId}
                  onChange={(e) => handleCreateInputChange('buildingId', e.target.value)}
                  className="management-select"
                >
                  <option value="">Selecione um edifício</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Capacidade *</label>
                <input
                  type="number"
                  value={createFormData.capacity}
                  onChange={(e) => handleCreateInputChange('capacity', e.target.value)}
                  placeholder="Número de lugares"
                  className="management-input"
                />
              </div>

              <div className="form-group">
                <label>Tipo de Sala</label>
                <select
                  value={createFormData.type}
                  onChange={(e) => handleCreateInputChange('type', e.target.value)}
                  className="management-select"
                >
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label>Equipamentos</label>
                <div className="equipment-grid">
                  {equipmentList.map(equip => (
                    <label key={equip.id} className="equipment-checkbox">
                      <input
                        type="checkbox"
                        checked={createFormData.equipment.includes(equip.id)}
                        onChange={() => toggleCreateEquipment(equip.id)}
                      />
                      <span className="equipment-icon">{equip.icon}</span>
                      <span>{equip.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-confirm" onClick={handleCreateSubmit}>
                <FaCheck /> Confirmar
              </button>
              <button className="btn-cancel-form" onClick={handleCancel}>
                <FaTimes /> Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ========== FORMULÁRIO DE ALTERAR ========== */}
        {activeAction === 'edit' && (
          <div className="action-panel">
            <h3>Alterar Sala</h3>

            {/* Seleção de Edifício */}
            <div className="form-group">
              <label>Edifício *</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => {
                  setSelectedBuildingId(e.target.value);
                  setSelectedRoomId('');
                }}
                className="management-select"
              >
                <option value="">Selecione um edifício</option>
                {buildings.map(building => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção de Sala (só aparece após selecionar edifício) */}
            {selectedBuildingId && (
              <div className="form-group">
                <label>Sala *</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => handleRoomSelectForEdit(e.target.value)}
                  className="management-select"
                >
                  <option value="">Selecione uma sala</option>
                  {filteredRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Formulário de Edição (só aparece após selecionar sala) */}
            {selectedRoomId && (
              <div className="edit-form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nome da Sala *</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="management-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Capacidade *</label>
                    <input
                      type="number"
                      value={editFormData.capacity}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      className="management-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tipo de Sala</label>
                    <select
                      value={editFormData.type}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="management-select"
                    >
                      {roomTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Equipamentos</label>
                    <div className="equipment-grid">
                      {equipmentList.map(equip => (
                        <label key={equip.id} className="equipment-checkbox">
                          <input
                            type="checkbox"
                            checked={editFormData.equipment.includes(equip.id)}
                            onChange={() => toggleEditEquipment(equip.id)}
                          />
                          <span className="equipment-icon">{equip.icon}</span>
                          <span>{equip.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-confirm" onClick={handleEditSubmit}>
                    <FaSave /> Guardar Alterações
                  </button>
                  <button className="btn-cancel-form" onClick={handleCancel}>
                    <FaTimes /> Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== FORMULÁRIO DE ELIMINAR ========== */}
        {activeAction === 'delete' && (
          <div className="action-panel">
            <h3>Eliminar Sala</h3>

            {/* Seleção de Edifício */}
            <div className="form-group">
              <label>Edifício *</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => {
                  setSelectedBuildingId(e.target.value);
                  setSelectedRoomId('');
                }}
                className="management-select"
              >
                <option value="">Selecione um edifício</option>
                {buildings.map(building => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção de Sala (só aparece após selecionar edifício) */}
            {selectedBuildingId && (
              <div className="form-group">
                <label>Sala *</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="management-select"
                >
                  <option value="">Selecione uma sala</option>
                  {filteredRooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Botão Eliminar (só aparece após selecionar sala) */}
            {selectedRoomId && (
              <div className="delete-actions">
                <button className="btn-delete-confirm" onClick={handleDeleteSubmit}>
                  <FaTrash /> Eliminar Sala
                </button>
                <button className="btn-cancel-form" onClick={handleCancel}>
                  <FaTimes /> Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mensagem quando nenhuma ação está selecionada */}
        {!activeAction && (
          <div className="info-placeholder">
            <p>Selecione uma ação: Criar, Alterar ou Eliminar uma sala</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRooms;