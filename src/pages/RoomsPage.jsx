// src/pages/RoomsPage.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RoomFilters from '../components/Filters/RoomFilters';
import RoomCard from '../components/Rooms/RoomCard';
import api from '../services/api';
import '../styles/rooms-page.css';
import '../styles/room-schedule.css';

// Soma minutos a uma hora "HH:MM" e devolve "HH:MM".
const addMinutes = (time, minutesToAdd) => {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutesToAdd;
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

const RoomsPage = () => {
  const location = useLocation();
  const [preFillData, setPreFillData] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [reservePurpose, setReservePurpose] = useState('');

  const [filters, setFilters] = useState({
    date: '',
    building: '',
    minCapacity: '',
    room: '',
    roomTypes: [],
    startTime: '',
    endTime: '',
    equipment: []
  });

  const [rooms, setRooms] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  // Verificar se veio da página de reservas para editar
  useEffect(() => {
    if (location.state?.editReservation) {
      setPreFillData({
        date: location.state.editReservation.data,
        building: location.state.editReservation.sala.edificio,
        room: location.state.editReservation.sala.nome
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Escutar evento de reserva rápida
  useEffect(() => {
    const handleQuickReserve = (event) => {
      handleSearch(event.detail, true);
    };

    window.addEventListener('openQuickReserve', handleQuickReserve);
    return () => window.removeEventListener('openQuickReserve', handleQuickReserve);
    // Subscrição única ao montar; handleSearch é estável o suficiente para este uso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requiredFiltersFilled = (currentFilters = filters) => {
    return currentFilters.date && currentFilters.building && currentFilters.minCapacity;
  };

  const handleSearch = async (searchFilters, isQuickReserve = false) => {
    if (!requiredFiltersFilled(searchFilters)) {
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const data = await api.getRooms(searchFilters);
      const foundRooms = Array.isArray(data) ? data : [];
      setRooms(foundRooms);

      if (isQuickReserve && foundRooms.length > 0) {
        const firstRoom = foundRooms[0];
        const schedule = firstRoom.schedule || {};
        const availableSlots = Object.keys(schedule).filter(time => schedule[time] === 'livre');
        if (availableSlots.length > 0) {
          setSelectedRoom(firstRoom);
          setSelectedSlots([availableSlots[0]]);
          setShowReserveModal(true);
        }
      }
    } catch (error) {
      console.error("Error searching rooms:", error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      date: '',
      building: '',
      minCapacity: '',
      room: '',
      roomTypes: [],
      startTime: '',
      endTime: '',
      equipment: []
    });
    setHasSearched(false);
    setRooms([]);
    setPreFillData(null);
  };

  const handleReserve = (room, slots) => {
    setSelectedRoom(room);
    setSelectedSlots(slots);
    setShowReserveModal(true);
  };

  const handleConfirmReserve = async () => {
    if (!reservePurpose.trim()) {
      alert('Por favor, descreva o propósito da reserva.');
      return;
    }

    // Os slots são marcas de 30 min; o fim é o último slot + 30 min.
    const horaInicio = selectedSlots[0];
    const horaFim = addMinutes(selectedSlots[selectedSlots.length - 1], 30);

    try {
      const result = await api.createReservation({
        roomId: selectedRoom.id,
        data: filters.date,
        horaInicio,
        horaFim,
        proposito: reservePurpose
      });

      if (result && result.id) {
        alert('Reserva submetida com sucesso! Aguarda aprovação do secretariado.');
        setShowReserveModal(false);
        setReservePurpose('');
        setSelectedRoom(null);
        setSelectedSlots([]);
        // Atualizar a grelha de horários
        handleSearch(filters);
      } else {
        const msg = result?.non_field_errors?.[0] || result?.detail || 'Não foi possível criar a reserva.';
        alert(msg);
      }
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      alert('Erro de ligação ao servidor.');
    }
  };

  return (
    <div className="rooms-page-layout">
      {/* Sidebar de Filtros */}
      <aside className="filters-sidebar">
        <RoomFilters
          onSearch={handleSearch}
          onClear={handleClearFilters}
          filters={filters}
          setFilters={setFilters}
          requiredFiltersFilled={requiredFiltersFilled}
          preFillFilters={preFillData}
        />
      </aside>

      {/* Conteúdo Principal */}
      <main className="rooms-main-content">
        <div className="rooms-content">
          {!requiredFiltersFilled(filters) && !hasSearched ? (
            <div className="info-message">
              <div className="info-card">
                <h3>⚠️ Preencha os filtros obrigatórios</h3>
                <p>Por favor preencha os filtros obrigatórios para visualizar as salas.</p>
                <p className="info-details">
                  Os filtros obrigatórios são: <strong>Data</strong>, <strong>Edifício</strong> e
                  <strong> Capacidade Mínima</strong> marcados com *
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="loading-message">
              <div className="spinner"></div>
              <p>Carregando salas disponíveis...</p>
            </div>
          ) : rooms.length === 0 && hasSearched ? (
            <div className="info-message">
              <div className="info-card">
                <h3>🔍 Nenhuma sala encontrada</h3>
                <p>Não foram encontradas salas com os critérios selecionados. Tente ajustar os filtros.</p>
              </div>
            </div>
          ) : (
            <div className="rooms-grid">
              {rooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  filters={filters}
                  onReserve={handleReserve}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Reserva */}
      {showReserveModal && selectedRoom && (
        <div className="modal-overlay" onClick={() => setShowReserveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Reserva</h3>
              <button className="modal-close" onClick={() => setShowReserveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="reserve-info">
                <p><strong>Sala:</strong> {selectedRoom.name}</p>
                <p><strong>Edifício:</strong> {selectedRoom.building}</p>
                <p><strong>Data:</strong> {filters.date}</p>
                <p><strong>Horário:</strong> {selectedSlots[0]} - {selectedSlots[selectedSlots.length - 1]}</p>
              </div>
              <div className="form-group">
                <label>Propósito da Reserva *</label>
                <textarea
                  value={reservePurpose}
                  onChange={(e) => setReservePurpose(e.target.value)}
                  placeholder="Descreva o motivo da reserva (ex: Aula, Reunião, Estudo, etc.)"
                  className="reserve-textarea"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowReserveModal(false)}>Cancelar</button>
              <button className="btn-confirm" onClick={handleConfirmReserve}>Confirmar Reserva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsPage;