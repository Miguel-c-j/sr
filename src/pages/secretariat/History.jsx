// src/pages/secretariat/History.jsx
import { useState, useEffect } from 'react';
import {
  FaSearch,
  FaCalendarAlt,
  FaBuilding,
  FaClock,
  FaFileExport,
  FaCheckSquare,
  FaSquare,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUser,
  FaEnvelope,
  FaDownload
} from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/secretariat.css';

const History = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [selectedReservations, setSelectedReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({
    buildingId: '',
    roomId: '',
    searchText: '',
    startDate: '',
    endDate: '',
    sortOrder: 'desc' // 'asc' ou 'desc'
  });

  const [selectAll, setSelectAll] = useState(false);

  // Carregar edifícios, salas (agrupadas por edifício) e histórico
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [buildingsData, roomsData, historyData] = await Promise.all([
          api.getBuildings(),
          api.getRooms(),
          api.getReservationHistory()
        ]);

        setBuildings(Array.isArray(buildingsData) ? buildingsData : []);

        // Agrupar salas por edifício no formato { [buildingId]: [{id, name, buildingId}] }
        const grouped = {};
        (Array.isArray(roomsData) ? roomsData : []).forEach(room => {
          if (!grouped[room.buildingId]) grouped[room.buildingId] = [];
          grouped[room.buildingId].push({ id: room.id, name: room.name, buildingId: room.buildingId });
        });
        setRooms(grouped);

        setReservations(Array.isArray(historyData) ? historyData : []);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Atualizar lista de salas quando edifício muda
  useEffect(() => {
    if (filters.buildingId && rooms[filters.buildingId]) {
      // Reset room filter when building changes
      setFilters(prev => ({ ...prev, roomId: '' }));
    }
  }, [filters.buildingId, rooms]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...reservations];

    // Filtrar por edifício
    if (filters.buildingId) {
      filtered = filtered.filter(res => res.sala.buildingId === parseInt(filters.buildingId));
    }

    // Filtrar por sala
    if (filters.roomId) {
      filtered = filtered.filter(res => res.sala.id === parseInt(filters.roomId));
    }

    // Filtrar por texto de busca
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(res =>
        res.proposito.toLowerCase().includes(searchLower) ||
        res.sala.name.toLowerCase().includes(searchLower) ||
        res.solicitante.nome.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por período
    if (filters.startDate) {
      filtered = filtered.filter(res => res.data >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(res => res.data <= filters.endDate);
    }

    // Ordenar por data
    filtered.sort((a, b) => {
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredReservations(filtered);
  }, [filters, reservations]);

  // Handle select all
  useEffect(() => {
    if (selectAll) {
      setSelectedReservations(filteredReservations.map(r => r.id));
    } else {
      setSelectedReservations([]);
    }
  }, [selectAll, filteredReservations]);

  const handleSelectReservation = (id) => {
    setSelectedReservations(prev =>
      prev.includes(id)
        ? prev.filter(resId => resId !== id)
        : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    if (selectedReservations.length === 0) {
      alert('Por favor, selecione pelo menos uma reserva para exportar.');
      return;
    }

    const selectedData = filteredReservations.filter(r => selectedReservations.includes(r.id));

    // Criar CSV
    const headers = ['ID', 'Sala', 'Edifício', 'Solicitante', 'Email', 'Data', 'Hora Início', 'Hora Fim', 'Duração', 'Propósito', 'Estado'];
    const csvRows = [
      headers.join(','),
      ...selectedData.map(res => [
        res.id,
        `"${res.sala.name}"`,
        `"${res.sala.buildingName}"`,
        `"${res.solicitante.nome}"`,
        res.solicitante.email,
        res.data,
        res.horaInicio,
        res.horaFim,
        res.duracao,
        `"${res.proposito}"`,
        res.estado
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservas_exportadas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`${selectedReservations.length} reserva(s) exportada(s) com sucesso!`);
  };

  const handleExportAll = () => {
    if (filteredReservations.length === 0) {
      alert('Não há reservas para exportar.');
      return;
    }

    const headers = ['ID', 'Sala', 'Edifício', 'Solicitante', 'Email', 'Data', 'Hora Início', 'Hora Fim', 'Duração', 'Propósito', 'Estado'];
    const csvRows = [
      headers.join(','),
      ...filteredReservations.map(res => [
        res.id,
        `"${res.sala.name}"`,
        `"${res.sala.buildingName}"`,
        `"${res.solicitante.nome}"`,
        res.solicitante.email,
        res.data,
        res.horaInicio,
        res.horaFim,
        res.duracao,
        `"${res.proposito}"`,
        res.estado
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservas_completas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`${filteredReservations.length} reserva(s) exportada(s) com sucesso!`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const getStatusBadge = (estado) => {
    if (estado === 'confirmada') {
      return <span className="status-badge-confirmed">✓ Confirmada</span>;
    } else if (estado === 'cancelada') {
      return <span className="status-badge-cancelled">✗ Cancelada</span>;
    }
    return <span className="status-badge-pending">⏳ Pendente</span>;
  };

  return (
    <div className="secretariat-page">
      <div className="page-header">
        <div>
          <h2>Histórico de Reservas</h2>
          <p className="page-description">Consultar e exportar reservas realizadas no sistema</p>
        </div>
        <div className="export-actions">
          <button
            className="btn-export-all"
            onClick={handleExportAll}
            disabled={filteredReservations.length === 0}
          >
            <FaDownload /> Exportar Todos
          </button>
          <button
            className="btn-export-selected"
            onClick={handleExportSelected}
            disabled={selectedReservations.length === 0}
          >
            <FaFileExport /> Exportar Selecionados ({selectedReservations.length})
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="history-filters">
        <div className="filters-grid">
          {/* Filtro Obrigatório - Edifício */}
          <div className="filter-group required">
            <label>
              <FaBuilding /> Edifício <span className="required-star">*</span>
            </label>
            <select
              value={filters.buildingId}
              onChange={(e) => setFilters(prev => ({ ...prev, buildingId: e.target.value, roomId: '' }))}
              className="filter-select"
            >
              <option value="">Selecione um edifício</option>
              {buildings.map(building => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Obrigatório - Sala (ativa apenas quando edifício selecionado) */}
          <div className="filter-group required">
            <label>
              <FaClock /> Sala <span className="required-star">*</span>
            </label>
            <select
              value={filters.roomId}
              onChange={(e) => setFilters(prev => ({ ...prev, roomId: e.target.value }))}
              disabled={!filters.buildingId}
              className={`filter-select ${!filters.buildingId ? 'disabled' : ''}`}
            >
              <option value="">Selecione uma sala</option>
              {filters.buildingId && rooms[filters.buildingId]?.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Busca por texto */}
          <div className="filter-group search-group">
            <label>
              <FaSearch /> Pesquisar
            </label>
            <input
              type="text"
              placeholder="Pesquisar por descrição, sala ou solicitante..."
              value={filters.searchText}
              onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
              className="search-input"
            />
          </div>

          {/* Período - Data Início */}
          <div className="filter-group">
            <label>
              <FaCalendarAlt /> Data Início
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="filter-input"
            />
          </div>

          {/* Período - Data Fim */}
          <div className="filter-group">
            <label>
              <FaCalendarAlt /> Data Fim
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="filter-input"
            />
          </div>

          {/* Ordenação */}
          <div className="filter-group">
            <label>
              {filters.sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              Ordenar por Data
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
              className="filter-select"
            >
              <option value="desc">Mais Recentes Primeiro</option>
              <option value="asc">Mais Antigas Primeiro</option>
            </select>
          </div>
        </div>

        {/* Aviso de filtros obrigatórios */}
        {(!filters.buildingId || !filters.roomId) && (
          <div className="required-filters-warning">
            <span className="warning-icon">⚠️</span>
            <span>Por favor, selecione um edifício e uma sala para visualizar as reservas</span>
          </div>
        )}
      </div>

      {/* Tabela de Reservas */}
      <div className="history-table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando histórico de reservas...</p>
          </div>
        ) : !filters.buildingId || !filters.roomId ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏢</div>
            <h3>Selecione um edifício e uma sala</h3>
            <p>Por favor, selecione um edifício e uma sala para visualizar o histórico de reservas.</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Nenhuma reserva encontrada</h3>
            <p>Não foram encontradas reservas para a sala selecionada no período indicado.</p>
          </div>
        ) : (
          <>
            <div className="table-info">
              <span>Total de reservas: <strong>{filteredReservations.length}</strong></span>
              <label className="select-all-label">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => setSelectAll(e.target.checked)}
                />
                Selecionar Todas
              </label>
            </div>

            <div className="table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th className="checkbox-col">Selecionar</th>
                    <th>Sala</th>
                    <th>Solicitante</th>
                    <th>Data</th>
                    <th>Horário</th>
                    <th>Duração</th>
                    <th>Propósito</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map(reservation => (
                    <tr key={reservation.id}>
                      <td className="checkbox-col">
                        <input
                          type="checkbox"
                          checked={selectedReservations.includes(reservation.id)}
                          onChange={() => handleSelectReservation(reservation.id)}
                        />
                      </td>
                      <td>
                        <div className="room-info-cell">
                          <strong>{reservation.sala.name}</strong>
                          <small>{reservation.sala.buildingName}</small>
                        </div>
                      </td>
                      <td>
                        <div className="user-info-cell">
                          <strong>{reservation.solicitante.nome}</strong>
                          <small>
                            <FaEnvelope /> {reservation.solicitante.email}
                          </small>
                        </div>
                      </td>
                      <td className="date-cell">
                        {formatDate(reservation.data)}
                      </td>
                      <td className="time-cell">
                        {reservation.horaInicio} - {reservation.horaFim}
                      </td>
                      <td>{reservation.duracao}</td>
                      <td className="purpose-cell" title={reservation.proposito}>
                        {reservation.proposito.length > 50
                          ? reservation.proposito.substring(0, 50) + '...'
                          : reservation.proposito}
                      </td>
                      <td>{getStatusBadge(reservation.estado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default History;