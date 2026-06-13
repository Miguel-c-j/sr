// src/pages/RoomsPage.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RoomFilters from '../components/Filters/RoomFilters';
import RoomCard from '../components/Rooms/RoomCard';
import '../styles/rooms-page.css';
import '../styles/room-schedule.css';

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

  // Mock data for rooms with complete schedule
  const mockRoomsData = [
    {
      id: 1,
      name: "Sala 101",
      building: "Colégio do Espírito Santo",
      capacity: 30,
      type: "aula",
      equipment: ["projetor", "quadro", "wifi"],
      schedule: {
        "08:00": "livre",
        "08:30": "livre",
        "09:00": "ocupado",
        "09:30": "ocupado",
        "10:00": "livre",
        "10:30": "livre",
        "11:00": "livre",
        "11:30": "reservado",
        "12:00": "reservado",
        "12:30": "livre",
        "13:00": "livre",
        "13:30": "livre",
        "14:00": "ocupado",
        "14:30": "ocupado",
        "15:00": "livre",
        "15:30": "livre",
        "16:00": "livre",
        "16:30": "livre",
        "17:00": "livre",
        "17:30": "livre",
        "18:00": "livre",
        "18:30": "livre",
        "19:00": "livre",
        "19:30": "livre",
        "20:00": "livre",
        "20:30": "livre",
        "21:00": "livre",
        "21:30": "livre",
        "22:00": "livre"
      }
    },
    {
      id: 2,
      name: "Laboratório 202",
      building: "Colégio do Espírito Santo",
      capacity: 20,
      type: "laboratorio",
      equipment: ["computadores", "projetor", "wifi"],
      schedule: {
        "08:00": "livre",
        "08:30": "ocupado",
        "09:00": "ocupado",
        "09:30": "livre",
        "10:00": "livre",
        "10:30": "livre",
        "11:00": "livre",
        "11:30": "ocupado",
        "12:00": "ocupado",
        "12:30": "livre",
        "13:00": "livre",
        "13:30": "reservado",
        "14:00": "reservado",
        "14:30": "livre",
        "15:00": "livre",
        "15:30": "livre",
        "16:00": "livre",
        "16:30": "livre",
        "17:00": "ocupado",
        "17:30": "ocupado",
        "18:00": "livre",
        "18:30": "livre",
        "19:00": "livre",
        "19:30": "livre",
        "20:00": "livre",
        "20:30": "livre",
        "21:00": "livre",
        "21:30": "livre",
        "22:00": "livre"
      }
    },
    {
      id: 3,
      name: "Sala de Reuniões 305",
      building: "Colégio Mateus de Aranda",
      capacity: 15,
      type: "reuniao",
      equipment: ["videoconferencia", "wifi", "quadro"],
      schedule: {
        "08:00": "livre",
        "08:30": "livre",
        "09:00": "livre",
        "09:30": "reservado",
        "10:00": "reservado",
        "10:30": "ocupado",
        "11:00": "ocupado",
        "11:30": "livre",
        "12:00": "livre",
        "12:30": "livre",
        "13:00": "livre",
        "13:30": "livre",
        "14:00": "livre",
        "14:30": "livre",
        "15:00": "reservado",
        "15:30": "reservado",
        "16:00": "livre",
        "16:30": "livre",
        "17:00": "livre",
        "17:30": "livre",
        "18:00": "livre",
        "18:30": "livre",
        "19:00": "livre",
        "19:30": "livre",
        "20:00": "livre",
        "20:30": "livre",
        "21:00": "livre",
        "21:30": "livre",
        "22:00": "livre"
      }
    }
  ];

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
      // Simular API call
      setTimeout(() => {
        // Filtrar salas baseado nos filtros
        let filteredRooms = [...mockRoomsData];

        // Filtrar por edifício
        if (searchFilters.building) {
          filteredRooms = filteredRooms.filter(room => room.building === searchFilters.building);
        }

        // Filtrar por capacidade
        if (searchFilters.minCapacity) {
          filteredRooms = filteredRooms.filter(room => room.capacity >= parseInt(searchFilters.minCapacity));
        }

        // Filtrar por sala específica
        if (searchFilters.room) {
          filteredRooms = filteredRooms.filter(room => room.name === searchFilters.room);
        }

        // Filtrar por tipo de sala
        if (searchFilters.roomTypes && searchFilters.roomTypes.length > 0) {
          filteredRooms = filteredRooms.filter(room => searchFilters.roomTypes.includes(room.type));
        }

        // Filtrar por equipamentos
        if (searchFilters.equipment && searchFilters.equipment.length > 0) {
          filteredRooms = filteredRooms.filter(room =>
            searchFilters.equipment.some(equip => room.equipment.includes(equip))
          );
        }

        setRooms(filteredRooms);
        setIsLoading(false);

        if (isQuickReserve && filteredRooms.length > 0) {
          const firstRoom = filteredRooms[0];
          const availableSlots = Object.keys(firstRoom.schedule).filter(time => firstRoom.schedule[time] === 'livre');
          if (availableSlots.length > 0) {
            setSelectedRoom(firstRoom);
            setSelectedSlots([availableSlots[0]]);
            setShowReserveModal(true);
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error searching rooms:", error);
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

  const handleConfirmReserve = () => {
    if (!reservePurpose.trim()) {
      alert('Por favor, descreva o propósito da reserva.');
      return;
    }

    alert(`Reserva confirmada!\n\nSala: ${selectedRoom.name}\nData: ${filters.date}\nHorário: ${selectedSlots[0]} - ${selectedSlots[selectedSlots.length - 1]}\nPropósito: ${reservePurpose}`);
    setShowReserveModal(false);
    setReservePurpose('');
    setSelectedRoom(null);
    setSelectedSlots([]);
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