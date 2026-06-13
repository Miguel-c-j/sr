import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaPlus, 
  FaCalendarAlt, 
  FaBuilding, 
  FaClock,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp
} from 'react-icons/fa';
import '../styles/reservations-page.css';

const ReservationsPage = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [filters, setFilters] = useState({
    status: 'todas',
    sortBy: 'proximas',
    searchText: '',
    dateRange: 'todas' // todas, esteMes, proximoMes
  });

  // Mock data - será substituído pela API real
  useEffect(() => {
    // Simular carregamento de dados da API
    setTimeout(() => {
      const mockReservations = [
        {
          id: 1,
          sala: {
            id: 101,
            nome: "Sala 101",
            edificio: "Colégio do Espírito Santo",
            capacidade: 30,
            tipo: "aula"
          },
          data: "2026-04-20",
          horaInicio: "09:00",
          horaFim: "11:00",
          estado: "confirmada",
          proposito: "Aula de Programação Web",
          criadoEm: "2026-04-01T10:00:00",
          ultimaAtualizacao: "2026-04-01T10:30:00"
        },
        {
          id: 2,
          sala: {
            id: 102,
            nome: "Laboratório 202",
            edificio: "Colégio do Espírito Santo",
            capacidade: 20,
            tipo: "laboratorio"
          },
          data: "2026-04-22",
          horaInicio: "14:00",
          horaFim: "17:00",
          estado: "pendente",
          proposito: "Trabalho de Grupo - IA",
          criadoEm: "2026-04-02T14:30:00",
          ultimaAtualizacao: "2026-04-02T14:30:00"
        },
        {
          id: 3,
          sala: {
            id: 201,
            nome: "Auditório",
            edificio: "Complexo Desportivo",
            capacidade: 150,
            tipo: "reuniao"
          },
          data: "2026-04-15",
          horaInicio: "10:00",
          horaFim: "12:00",
          estado: "cancelada",
          proposito: "Palestra Convidada",
          criadoEm: "2026-03-28T09:00:00",
          ultimaAtualizacao: "2026-04-10T15:20:00"
        },
        {
          id: 4,
          sala: {
            id: 104,
            nome: "Sala 104",
            edificio: "Colégio Mateus de Aranda",
            capacidade: 25,
            tipo: "reuniao"
          },
          data: "2026-05-05",
          horaInicio: "15:30",
          horaFim: "17:30",
          estado: "confirmada",
          proposito: "Reunião de Projeto",
          criadoEm: "2026-04-05T11:00:00",
          ultimaAtualizacao: "2026-04-05T11:15:00"
        },
        {
          id: 5,
          sala: {
            id: 105,
            nome: "Sala 205",
            edificio: "Colégio do Espírito Santo",
            capacidade: 40,
            tipo: "aula"
          },
          data: "2026-04-18",
          horaInicio: "08:00",
          horaFim: "10:00",
          estado: "rejeitada",
          proposito: "Aula de Matemática",
          criadoEm: "2026-04-03T08:30:00",
          ultimaAtualizacao: "2026-04-04T09:00:00",
          motivoRejeicao: "Conflito com evento institucional"
        },
        {
          id: 6,
          sala: {
            id: 106,
            nome: "Sala 306",
            edificio: "Pólo da Mitra",
            capacidade: 35,
            tipo: "laboratorio"
          },
          data: "2026-04-25",
          horaInicio: "13:00",
          horaFim: "16:00",
          estado: "pendente",
          proposito: "Experiências de Química",
          criadoEm: "2026-04-06T16:00:00",
          ultimaAtualizacao: "2026-04-06T16:00:00"
        }
      ];
      
      setReservations(mockReservations);
      setIsLoading(false);
    }, 500);
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    let filtered = [...reservations];

    // Filtrar por estado
    if (filters.status !== 'todas') {
      filtered = filtered.filter(res => res.estado === filters.status);
    }

    // Filtrar por texto de busca
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(res => 
        res.sala.nome.toLowerCase().includes(searchLower) ||
        res.sala.edificio.toLowerCase().includes(searchLower) ||
        res.proposito.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por período
    const hoje = new Date();
    const currentDate = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    
    if (filters.dateRange === 'esteMes') {
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      filtered = filtered.filter(res => {
        const dataReserva = new Date(res.data);
        return dataReserva >= inicioMes && dataReserva <= fimMes;
      });
    }

    // Ordenar
    if (filters.sortBy === 'proximas') {
      filtered.sort((a, b) => new Date(a.data) - new Date(b.data));
    } else if (filters.sortBy === 'distantes') {
      filtered.sort((a, b) => new Date(b.data) - new Date(a.data));
    }

    setFilteredReservations(filtered);
  }, [filters, reservations]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCancelReservation = async (reservationId) => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      try {
        // TODO: Chamar API para cancelar reserva
        // await api.cancelReservation(reservationId);
        
        // Atualizar estado local
        setReservations(prev => 
          prev.map(res => 
            res.id === reservationId 
              ? { ...res, estado: 'cancelada' }
              : res
          )
        );
        
        alert('Reserva cancelada com sucesso!');
      } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        alert('Erro ao cancelar reserva. Tente novamente.');
      }
    }
  };

  const handleEditReservation = (reservation) => {
    // Navegar para página de salas com os dados da reserva
    navigate('/salas', { 
      state: { 
        editReservation: reservation,
        preFillFilters: {
          date: reservation.data,
          building: reservation.sala.edificio,
          room: reservation.sala.nome
        }
      }
    });
  };

  const handleNewReservation = () => {
    navigate('/salas');
  };

  const getStatusConfig = (estado) => {
    const configs = {
      confirmada: {
        icon: '✅',
        color: 'status-confirmed',
        label: 'Confirmada',
        bgColor: '#d4edda'
      },
      pendente: {
        icon: '⏳',
        color: 'status-pending',
        label: 'Pendente',
        bgColor: '#fff3cd'
      },
      cancelada: {
        icon: '❌',
        color: 'status-cancelled',
        label: 'Cancelada',
        bgColor: '#f8d7da'
      },
      rejeitada: {
        icon: '⚠️',
        color: 'status-rejected',
        label: 'Rejeitada',
        bgColor: '#f8d7da'
      },
      conflito: {
        icon: '🔴',
        color: 'status-conflict',
        label: 'Conflito',
        bgColor: '#f8d7da'
      }
    };
    return configs[estado] || configs.pendente;
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-PT', options);
  };

  return (
    <div className="reservations-page">
      <div className="reservations-header">
        <h2>Minhas Reservas</h2>
        <button className="btn-new-reservation" onClick={handleNewReservation}>
          <FaPlus /> Nova Reserva
        </button>
      </div>

      {/* Área de Filtros */}
      <div className="reservations-filters">
        <div className="filters-row">
          <div className="filter-group search-group">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por sala, edifício ou propósito..."
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label>
              <FaFilter /> Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="todas">Todas</option>
              <option value="pendente">Pendentes</option>
              <option value="confirmada">Confirmadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="rejeitada">Rejeitadas</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              {filters.sortBy === 'proximas' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              Ordenar
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="filter-select"
            >
              <option value="proximas">Mais próximas primeiro</option>
              <option value="distantes">Mais distantes primeiro</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaCalendarAlt /> Período
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="filter-select"
            >
              <option value="todas">Todas as reservas</option>
              <option value="esteMes">Este mês</option>
            </select>
          </div>
        </div>

        {/* Indicador de resultados */}
        <div className="results-info">
          Mostrando {filteredReservations.length} de {reservations.length} reservas
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="reservations-list">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando suas reservas...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>Ainda não tem nenhuma reserva</h3>
            <p>Clique em "Nova Reserva" para começar a reservar salas para suas atividades</p>
            <button className="btn-primary" onClick={handleNewReservation}>
              <FaPlus /> Nova Reserva
            </button>
          </div>
        ) : (
          <div className="reservations-grid">
            {filteredReservations.map(reservation => {
              const statusConfig = getStatusConfig(reservation.estado);
              const isEditable = reservation.estado === 'pendente' || reservation.estado === 'confirmada';
              const isCancellable = reservation.estado !== 'cancelada' && reservation.estado !== 'rejeitada';
              
              return (
                <div key={reservation.id} className="reservation-card">
                  <div className="card-header">
                    <div className="room-info">
                      <h3>{reservation.sala.nome}</h3>
                      <span className="room-building">
                        <FaBuilding /> {reservation.sala.edificio}
                      </span>
                    </div>
                    <div className={`status-badge ${statusConfig.color}`}>
                      <span className="status-icon">{statusConfig.icon}</span>
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="detail-row">
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <div>
                          <div className="detail-label">Data</div>
                          <div className="detail-value">{formatDate(reservation.data)}</div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <div>
                          <div className="detail-label">Horário</div>
                          <div className="detail-value">
                            {reservation.horaInicio} - {reservation.horaFim}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="detail-item full-width">
                      <div className="detail-label">Propósito</div>
                      <div className="detail-value purpose">{reservation.proposito}</div>
                    </div>

                    {reservation.estado === 'rejeitada' && reservation.motivoRejeicao && (
                      <div className="rejection-reason">
                        <strong>Motivo da rejeição:</strong> {reservation.motivoRejeicao}
                      </div>
                    )}

                    <div className="reservation-meta">
                      <small>
                        Criada em: {new Date(reservation.criadoEm).toLocaleDateString('pt-PT')}
                      </small>
                      {reservation.ultimaAtualizacao !== reservation.criadoEm && (
                        <small>
                          Última atualização: {new Date(reservation.ultimaAtualizacao).toLocaleDateString('pt-PT')}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="card-actions">
                    {isEditable && (
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditReservation(reservation)}
                      >
                        <FaEdit /> Alterar
                      </button>
                    )}
                    {isCancellable && (
                      <button 
                        className="btn-cancel" 
                        onClick={() => handleCancelReservation(reservation.id)}
                      >
                        <FaTrash /> Desistir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationsPage;