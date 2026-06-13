// src/components/Rooms/RoomCard.jsx
import { useState } from 'react';
import { FaUsers, FaBuilding, FaWifi, FaVideo, FaDesktop, FaSnowflake } from 'react-icons/fa';
import { MdMeetingRoom, MdScience } from 'react-icons/md';
import RoomSchedule from './RoomSchedule';

const RoomCard = ({ room, filters, onReserve }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);

  const getRoomIcon = (type) => {
    switch(type) {
      case 'aula':
        return <MdMeetingRoom />;
      case 'laboratorio':
        return <MdScience />;
      case 'reuniao':
        return <FaUsers />;
      default:
        return <MdMeetingRoom />;
    }
  };

  const getEquipmentIcon = (equip) => {
    switch(equip) {
      case 'wifi':
        return <FaWifi />;
      case 'videoconferencia':
        return <FaVideo />;
      case 'computadores':
        return <FaDesktop />;
      case 'arcondicionado':
        return <FaSnowflake />;
      default:
        return null;
    }
  };

  const handleReserve = () => {
    if (selectedSlots.length > 0 && onReserve) {
      onReserve(room, selectedSlots);
    } else {
      alert('Por favor, selecione pelo menos um bloco de horário para reservar.');
    }
  };

  return (
    <div className="room-card">
      <div className="room-card-header">
        <div className="room-title">
          {getRoomIcon(room.type)}
          <h3>{room.name}</h3>
        </div>
        <div className="room-capacity">
          <FaUsers />
          <span>{room.capacity} lugares</span>
        </div>
      </div>

      <div className="room-details">
        <div className="room-info">
          <FaBuilding />
          <span>{room.building}</span>
        </div>
        <div className="room-type">
          <span className={`type-badge ${room.type}`}>
            {room.type === 'aula' ? 'Aula' : room.type === 'laboratorio' ? 'Laboratório' : 'Reunião'}
          </span>
        </div>
      </div>

      {room.equipment && room.equipment.length > 0 && (
        <div className="room-equipment">
          {room.equipment.map(equip => (
            <span key={equip} className="equipment-badge" title={equip}>
              {getEquipmentIcon(equip)}
              <span className="equipment-label">{equip}</span>
            </span>
          ))}
        </div>
      )}

      <div className="room-schedule-container">
        <RoomSchedule
          schedule={room.schedule}
          date={filters.date}
          startTime={filters.startTime}
          endTime={filters.endTime}
          onSelectSlot={setSelectedSlots}
          selectedSlots={selectedSlots}
        />
      </div>

      <div className="room-actions">
        <button className="btn-reserve" onClick={handleReserve}>
          Reservar
        </button>
      </div>
    </div>
  );
};

export default RoomCard;