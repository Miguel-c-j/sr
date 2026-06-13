// src/components/Filters/RoomFilters.jsx
import { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaBookmark, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const RoomFilters = ({ onSearch, onClear, filters, setFilters, requiredFiltersFilled, preFillFilters = null }) => {
  // Estados para os accordions
  const [openSections, setOpenSections] = useState({
    data: true,
    edificio: true,
    capacidade: true,
    sala: false,
    tipoSala: false,
    horario: false,
    equipamentos: false
  });

  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedBuildingName, setSelectedBuildingName] = useState('');

  // Mock data for filters
  const buildings = [
    { id: 1, name: "Colégio do Espírito Santo" },
    { id: 2, name: "Colégio Mateus de Aranda" },
    { id: 3, name: "Pólo da Mitra" },
    { id: 4, name: "Complexo Desportivo" }
  ];

  // Rooms by building
  const roomsByBuilding = {
    "Colégio do Espírito Santo": [
      { id: 1, name: "Sala 101" },
      { id: 2, name: "Sala 102" },
      { id: 3, name: "Laboratório 202" }
    ],
    "Colégio Mateus de Aranda": [
      { id: 4, name: "Sala de Reuniões 305" },
      { id: 5, name: "Sala 201" }
    ],
    "Pólo da Mitra": [
      { id: 6, name: "Sala 001" },
      { id: 7, name: "Sala 002" }
    ],
    "Complexo Desportivo": [
      { id: 8, name: "Auditório" },
      { id: 9, name: "Sala de Dança" }
    ]
  };

  const roomTypes = [
    { id: "aula", label: "Aula" },
    { id: "reuniao", label: "Reunião" },
    { id: "laboratorio", label: "Laboratório" }
  ];

  const equipmentList = [
    { id: "projetor", label: "Projetor" },
    { id: "wifi", label: "WiFi" },
    { id: "quadro", label: "Quadro Branco" },
    { id: "computadores", label: "Computadores" },
    { id: "arcondicionado", label: "Ar Condicionado" },
    { id: "videoconferencia", label: "Videoconferência" }
  ];

  // Generate time slots every 30 minutes
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Efeito para pré-preenchimento
  useEffect(() => {
    if (preFillFilters) {
      const newFilters = { ...filters, ...preFillFilters };
      setFilters(newFilters);
      if (newFilters.building) {
        setSelectedBuildingName(newFilters.building);
      }
    }
  }, [preFillFilters]);

  // Update available rooms when building changes
  useEffect(() => {
    if (filters.building) {
      setAvailableRooms(roomsByBuilding[filters.building] || []);
      setSelectedBuildingName(filters.building);
    } else {
      setAvailableRooms([]);
      setSelectedBuildingName('');
    }
  }, [filters.building]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleBuildingChange = (e) => {
    const selectedValue = e.target.value;
    setFilters(prev => ({
      ...prev,
      building: selectedValue,
      room: '' // Reset room when building changes
    }));
  };

  const handleEquipmentChange = (equipmentId) => {
    const newEquipment = filters.equipment.includes(equipmentId)
      ? filters.equipment.filter(id => id !== equipmentId)
      : [...filters.equipment, equipmentId];
    handleFilterChange('equipment', newEquipment);
  };

  const handleSearchClick = () => {
    if (requiredFiltersFilled(filters)) {
      onSearch(filters);
    }
  };

  const handleQuickReserve = () => {
    if (requiredFiltersFilled(filters)) {
      // Emitir evento para abrir modal de reserva rápida
      const event = new CustomEvent('openQuickReserve', { detail: filters });
      window.dispatchEvent(event);
    }
  };

  return (
    <div className="filters-container">
      <h2 className="filters-title">Filtros</h2>

      {/* Data */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('data')}>
          <span>Data <span className="required-star">*</span></span>
          {openSections.data ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.data && (
          <div className="filter-section-content">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="filter-input"
            />
          </div>
        )}
      </div>

      {/* Edifício */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('edificio')}>
          <span>Edifício <span className="required-star">*</span></span>
          {openSections.edificio ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.edificio && (
          <div className="filter-section-content">
            <select
              value={filters.building}
              onChange={handleBuildingChange}
              className="filter-select"
            >
              <option value="">Selecione um edifício</option>
              {buildings.map(building => (
                <option key={building.id} value={building.name}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Capacidade Mínima */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('capacidade')}>
          <span>Capacidade Mínima <span className="required-star">*</span></span>
          {openSections.capacidade ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.capacidade && (
          <div className="filter-section-content">
            <input
              type="number"
              min="1"
              value={filters.minCapacity}
              onChange={(e) => handleFilterChange('minCapacity', e.target.value)}
              className="filter-input"
              placeholder="Nº de pessoas"
            />
          </div>
        )}
      </div>

      {/* Sala (apenas visível se edifício selecionado) */}
      {filters.building && (
        <div className="filter-section">
          <div className="filter-section-header" onClick={() => toggleSection('sala')}>
            <span>Sala</span>
            {openSections.sala ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {openSections.sala && (
            <div className="filter-section-content">
              <select
                value={filters.room}
                onChange={(e) => handleFilterChange('room', e.target.value)}
                className="filter-select"
              >
                <option value="">Todas as salas</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.name}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Tipo de Sala */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('tipoSala')}>
          <span>Tipo de Sala</span>
          {openSections.tipoSala ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.tipoSala && (
          <div className="filter-section-content">
            {roomTypes.map(type => (
              <label key={type.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.roomTypes.includes(type.id)}
                  onChange={() => {
                    const newTypes = filters.roomTypes.includes(type.id)
                      ? filters.roomTypes.filter(t => t !== type.id)
                      : [...filters.roomTypes, type.id];
                    handleFilterChange('roomTypes', newTypes);
                  }}
                />
                {type.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Bloco de Horário */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('horario')}>
          <span>Bloco de Horário</span>
          {openSections.horario ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.horario && (
          <div className="filter-section-content">
            <div className="time-range-group">
              <label className="time-label">Hora de Início</label>
              <select
                value={filters.startTime}
                onChange={(e) => handleFilterChange('startTime', e.target.value)}
                className="filter-select"
              >
                <option value="">Selecione</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="time-range-group">
              <label className="time-label">Hora de Fim</label>
              <select
                value={filters.endTime}
                onChange={(e) => handleFilterChange('endTime', e.target.value)}
                className="filter-select"
              >
                <option value="">Selecione</option>
                {timeSlots.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Equipamentos */}
      <div className="filter-section">
        <div className="filter-section-header" onClick={() => toggleSection('equipamentos')}>
          <span>Equipamentos</span>
          {openSections.equipamentos ? <FaChevronUp /> : <FaChevronDown />}
        </div>
        {openSections.equipamentos && (
          <div className="filter-section-content equipment-list">
            {equipmentList.map(equip => (
              <label key={equip.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.equipment.includes(equip.id)}
                  onChange={() => handleEquipmentChange(equip.id)}
                />
                {equip.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="filters-actions">
        <button
          className="btn btn-reserve"
          onClick={handleQuickReserve}
          disabled={!requiredFiltersFilled(filters)}
        >
          <FaBookmark /> Reservar
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSearchClick}
          disabled={!requiredFiltersFilled(filters)}
        >
          <FaSearch /> Pesquisar
        </button>
        <button
          className="btn btn-secondary"
          onClick={onClear}
        >
          <FaTrash /> Limpar Filtros
        </button>
      </div>
    </div>
  );
};

export default RoomFilters;