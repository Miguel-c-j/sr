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
import api from '../../services/api';
import '../../styles/management.css';

const ManageRooms = () => {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);

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

  // Carregar edifícios, salas e equipamentos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [buildingsData, roomsData, equipmentData] = await Promise.all([
          api.getBuildings(),
          api.getRooms(),
          api.getEquipment()
        ]);
        setBuildings(Array.isArray(buildingsData) ? buildingsData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        // Mapear equipamentos do servidor para o formato dos checkboxes ({id: code}).
        setEquipmentList(
          (Array.isArray(equipmentData) ? equipmentData : []).map(eq => ({
            id: eq.code,
            label: eq.name,
            icon: eq.icon
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };
    fetchData();
  }, []);

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
  const handleCreateSubmit = async () => {
    if (!createFormData.name || !createFormData.capacity || !createFormData.buildingId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const created = await api.createRoom({
        name: createFormData.name,
        capacity: parseInt(createFormData.capacity),
        buildingId: parseInt(createFormData.buildingId),
        type: createFormData.type,
        equipment: [...createFormData.equipment]
      });
      if (created?.id) {
        setRooms(prev => [...prev, created]);
        alert('Sala criada com sucesso!');
        setActiveAction(null);
      } else {
        alert('Não foi possível criar a sala.');
      }
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      alert('Erro ao criar sala.');
    }
  };

  // Submeter edição
  const handleEditSubmit = async () => {
    if (!editFormData.name || !editFormData.capacity || !editFormData.buildingId) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const updated = await api.updateRoom(editFormData.id, {
        name: editFormData.name,
        capacity: parseInt(editFormData.capacity),
        buildingId: parseInt(editFormData.buildingId),
        type: editFormData.type,
        equipment: [...editFormData.equipment]
      });
      if (updated?.id) {
        setRooms(prev => prev.map(room => (room.id === editFormData.id ? updated : room)));
        alert('Sala atualizada com sucesso!');
        setActiveAction(null);
        setSelectedBuildingId('');
        setSelectedRoomId('');
      } else {
        alert('Não foi possível atualizar a sala.');
      }
    } catch (error) {
      console.error('Erro ao atualizar sala:', error);
      alert('Erro ao atualizar sala.');
    }
  };

  // Eliminar sala
  const handleDeleteSubmit = async () => {
    if (!selectedRoomId) {
      alert('Por favor, selecione uma sala para eliminar.');
      return;
    }

    if (window.confirm('Tem certeza que deseja eliminar esta sala? Esta ação não pode ser desfeita.')) {
      try {
        const ok = await api.deleteRoom(parseInt(selectedRoomId));
        if (ok) {
          setRooms(prev => prev.filter(room => room.id !== parseInt(selectedRoomId)));
          alert('Sala eliminada com sucesso!');
          setActiveAction(null);
          setSelectedBuildingId('');
          setSelectedRoomId('');
        } else {
          alert('Não foi possível eliminar a sala (poderá ter reservas associadas).');
        }
      } catch (error) {
        console.error('Erro ao eliminar sala:', error);
        alert('Erro ao eliminar sala.');
      }
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