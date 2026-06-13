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

  // Mock data
  useEffect(() => {
    // Mock buildings
    const mockBuildings = [
      { id: 1, name: 'Colégio do Espírito Santo' },
      { id: 2, name: 'Colégio Mateus de Aranda' },
      { id: 3, name: 'Pólo da Mitra' },
      { id: 4, name: 'Complexo Desportivo' }
    ];

    // Mock rooms
    const mockRooms = {
      1: [
        { id: 101, name: 'Sala 101', buildingId: 1 },
        { id: 102, name: 'Sala 102', buildingId: 1 },
        { id: 103, name: 'Laboratório 202', buildingId: 1 }
      ],
      2: [
        { id: 201, name: 'Sala de Reuniões 305', buildingId: 2 },
        { id: 202, name: 'Sala 201', buildingId: 2 }
      ],
      3: [
        { id: 301, name: 'Sala 001', buildingId: 3 },
        { id: 302, name: 'Sala 002', buildingId: 3 }
      ],
      4: [
        { id: 401, name: 'Auditório', buildingId: 4 },
        { id: 402, name: 'Sala de Dança', buildingId: 4 }
      ]
    };

    // Mock reservations (últimos 3 meses)
    const mockReservations = [
      {
        id: 1,
        sala: { id: 101, name: 'Sala 101', buildingId: 1, buildingName: 'Colégio do Espírito Santo' },
        solicitante: { nome: 'Prof. Ana Silva', email: 'ana.silva@uevora.pt', tipo: 'docente' },
        data: '2026-03-15',
        horaInicio: '09:00',
        horaFim: '11:00',
        duracao: '2 horas',
        proposito: 'Aula de Programação Web - Exame Final',
        estado: 'confirmada',
        criadoEm: '2026-03-01T10:00:00'
      },
      {
        id: 2,
        sala: { id: 103, name: 'Laboratório 202', buildingId: 1, buildingName: 'Colégio do Espírito Santo' },
        solicitante: { nome: 'Dr. Carlos Santos', email: 'carlos.santos@uevora.pt', tipo: 'docente' },
        data: '2026-03-20',
        horaInicio: '14:00',
        horaFim: '17:00',
        duracao: '3 horas',
        proposito: 'Experiências de Química - Laboratório Prático',
        estado: 'confirmada',
        criadoEm: '2026-03-05T14:15:00'
      },
      {
        id: 3,
        sala: { id: 201, name: 'Sala de Reuniões 305', buildingId: 2, buildingName: 'Colégio Mateus de Aranda' },
        solicitante: { nome: 'Maria Oliveira', email: 'maria.oliveira@alunos.uevora.pt', tipo: 'estudante' },
        data: '2026-03-25',
        horaInicio: '10:00',
        horaFim: '12:00',
        duracao: '2 horas',
        proposito: 'Reunião de Grupo - Projeto Final de Curso',
        estado: 'confirmada',
        criadoEm: '2026-03-10T11:00:00'
      },
      {
        id: 4,
        sala: { id: 401, name: 'Auditório', buildingId: 4, buildingName: 'Complexo Desportivo' },
        solicitante: { nome: 'Prof. João Mendes', email: 'joao.mendes@uevora.pt', tipo: 'docente' },
        data: '2026-03-28',
        horaInicio: '09:00',
        horaFim: '13:00',
        duracao: '4 horas',
        proposito: 'Palestra sobre Inovação Tecnológica',
        estado: 'confirmada',
        criadoEm: '2026-03-15T08:45:00'
      },
      {
        id: 5,
        sala: { id: 102, name: 'Sala 102', buildingId: 1, buildingName: 'Colégio do Espírito Santo' },
        solicitante: { nome: 'Teresa Costa', email: 'teresa.costa@alunos.uevora.pt', tipo: 'estudante' },
        data: '2026-04-05',
        horaInicio: '15:00',
        horaFim: '17:00',
        duracao: '2 horas',
        proposito: 'Estudo em Grupo - Preparação para Exames',
        estado: 'confirmada',
        criadoEm: '2026-03-20T16:30:00'
      },
      {
        id: 6,
        sala: { id: 202, name: 'Sala 201', buildingId: 2, buildingName: 'Colégio Mateus de Aranda' },
        solicitante: { nome: 'Prof. António Pereira', email: 'antonio.pereira@uevora.pt', tipo: 'docente' },
        data: '2026-04-10',
        horaInicio: '11:00',
        horaFim: '13:00',
        duracao: '2 horas',
        proposito: 'Aula de Matemática Discreta',
        estado: 'cancelada',
        criadoEm: '2026-03-25T09:20:00'
      },
      {
        id: 7,
        sala: { id: 301, name: 'Sala 001', buildingId: 3, buildingName: 'Pólo da Mitra' },
        solicitante: { nome: 'Dra. Sofia Rodrigues', email: 'sofia.rodrigues@uevora.pt', tipo: 'docente' },
        data: '2026-04-12',
        horaInicio: '08:00',
        horaFim: '10:00',
        duracao: '2 horas',
        proposito: 'Exame de Física - Época Normal',
        estado: 'confirmada',
        criadoEm: '2026-03-28T14:00:00'
      },
      {
        id: 8,
        sala: { id: 402, name: 'Sala de Dança', buildingId: 4, buildingName: 'Complexo Desportivo' },
        solicitante: { nome: 'Carlos Ferreira', email: 'carlos.ferreira@alunos.uevora.pt', tipo: 'estudante' },
        data: '2026-04-18',
        horaInicio: '16:00',
        horaFim: '18:00',
        duracao: '2 horas',
        proposito: 'Ensaio de Grupo de Teatro',
        estado: 'confirmada',
        criadoEm: '2026-04-01T17:45:00'
      }
    ];

    setBuildings(mockBuildings);
    setRooms(mockRooms);
    setReservations(mockReservations);
    setIsLoading(false);
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