// src/components/Filters/RoomFilters.jsx
import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaTrash, FaBookmark, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import api from '../../services/api';

// Rótulos amigáveis para os tipos de sala (valores vindos do backend).
const ROOM_TYPE_LABELS = {
  aula: 'Sala de Aula',
  laboratorio: 'Laboratório',
  reuniao: 'Sala de Reuniões',
  auditorio: 'Auditório',
};

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

  // Edifícios, salas e equipamentos reais, carregados da API (substituem os dados estáticos).
  const [buildings, setBuildings] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [allEquipment, setAllEquipment] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [b, r, e] = await Promise.all([
        api.getBuildings(),
        api.getRooms(),
        api.getEquipment(),
      ]);
      if (!active) return;
      setBuildings(Array.isArray(b) ? b : []);
      setAllRooms(Array.isArray(r) ? r : []);
      setAllEquipment(Array.isArray(e) ? e : []);
    })();
    return () => { active = false; };
  }, []);

  // Tipos de sala derivados das salas reais — assim nenhum tipo do seed fica de fora.
  const roomTypes = useMemo(() => {
    const types = [...new Set(allRooms.map(r => r.type).filter(Boolean))].sort();
    return types.map(t => ({ id: t, label: ROOM_TYPE_LABELS[t] || t }));
  }, [allRooms]);

  // Equipamentos da API: o `code` é o valor que o backend filtra (equipment__code__in).
  const equipmentList = useMemo(
    () => allEquipment.map(e => ({ id: e.code, label: e.name, icon: e.icon })),
    [allEquipment]
  );

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

  // Pré-preenchimento: quando chega a prop preFillFilters, sincroniza os filtros do
  // componente-pai. É um efeito de sincronização legítimo (prop externa -> estado).
  useEffect(() => {
    if (preFillFilters) {
      setFilters(prev => ({ ...prev, ...preFillFilters }));
    }
  }, [preFillFilters, setFilters]);

  // Salas disponíveis para o edifício selecionado (derivado de filters.building).
  // Cada sala da API traz o nome do edifício em `building`.
  const availableRooms = useMemo(
    () => (filters.building ? allRooms.filter(r => r.building === filters.building) : []),
    [filters.building, allRooms]
  );

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
                {equip.icon ? `${equip.icon} ` : ''}{equip.label}
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