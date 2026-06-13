// src/components/Rooms/RoomSchedule.jsx
import { useState } from 'react';

const RoomSchedule = ({ schedule, date, startTime, endTime, onSelectSlot, selectedSlots = [], reservedSlots = [] }) => {
  const [selectedTimeSlots, setSelectedTimeSlots] = useState(selectedSlots);

  // Generate time slots from 8:00 to 22:00 (30 min intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 21; hour++) {
      for (let minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    // Add 22:00
    slots.push('22:00');
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Determine which slots to show based on filters
  const startIndex = startTime ? timeSlots.indexOf(startTime) : 0;
  const endIndex = endTime ? timeSlots.indexOf(endTime) : timeSlots.length;
  const visibleSlots = timeSlots.slice(startIndex, endIndex + 1);

  const getSlotStatus = (time) => {
    if (selectedTimeSlots.includes(time)) return 'selected';
    if (reservedSlots.includes(time)) return 'reserved';
    if (schedule && schedule[time] === 'ocupado') return 'occupied';
    if (schedule && schedule[time] === 'reservado') return 'reserved';
    return 'free';
  };

  const isSlotSelectable = (time) => {
    const status = getSlotStatus(time);
    return status === 'free';
  };

  const handleSlotClick = (time) => {
    if (!isSlotSelectable(time)) return;

    let newSelectedSlots;
    if (selectedTimeSlots.includes(time)) {
      // Deselect the slot
      newSelectedSlots = selectedTimeSlots.filter(t => t !== time);
    } else {
      // Check if it forms a continuous block with existing selections
      if (selectedTimeSlots.length === 0) {
        newSelectedSlots = [time];
      } else {
        const allSlots = [...selectedTimeSlots, time].sort();
        const currentIndex = visibleSlots.indexOf(time);

        // Check if the new slot is adjacent to any existing selection
        let isAdjacent = false;
        for (const selected of selectedTimeSlots) {
          const selectedIndex = visibleSlots.indexOf(selected);
          if (Math.abs(currentIndex - selectedIndex) === 1) {
            isAdjacent = true;
            break;
          }
        }

        if (isAdjacent) {
          // Add to selection and maintain continuity
          newSelectedSlots = allSlots;
        } else {
          // Start new selection
          newSelectedSlots = [time];
        }
      }
    }

    setSelectedTimeSlots(newSelectedSlots);
    if (onSelectSlot) {
      onSelectSlot(newSelectedSlots);
    }
  };

  return (
    <div className="room-schedule">
      <div className="schedule-header">
        <div className="schedule-date">
          <span className="date-label">Hora</span>
          <span className="date-value">{date || 'data selecionada'}</span>
        </div>
        <div className="schedule-legend">
          <div className="legend-item">
            <div className="legend-color free"></div>
            <span>Livre</span>
          </div>
          <div className="legend-item">
            <div className="legend-color occupied"></div>
            <span>Ocupado</span>
          </div>
          <div className="legend-item">
            <div className="legend-color reserved"></div>
            <span>Reservado</span>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>Selecionado</span>
          </div>
        </div>
      </div>

      <div className="schedule-slots">
        {visibleSlots.map((time, index) => {
          const status = getSlotStatus(time);
          const isSelectable = isSlotSelectable(time);
          const nextTime = visibleSlots[index + 1];
          const slotLabel = `${time} - ${nextTime || '22:30'}`;

          return (
            <div
              key={time}
              className={`schedule-slot ${status} ${isSelectable ? 'clickable' : ''}`}
              onClick={() => isSelectable && handleSlotClick(time)}
            >
              <span className="slot-time">{slotLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomSchedule;