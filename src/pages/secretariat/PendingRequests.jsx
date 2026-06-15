import { useState, useEffect } from 'react';
import {
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaUser,
  FaBuilding,
  FaClock,
  FaInfoCircle,
  FaCheckDouble,
  FaExclamationTriangle
} from 'react-icons/fa';
import api from '../../services/api';
import '../../styles/secretariat.css';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [currentRejectRequest, setCurrentRejectRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Filtros
  const [filters, setFilters] = useState({
    sortBy: 'maisAntigos',
    searchText: '',
    dateRange: 'todas'
  });

  // Carregar pedidos pendentes
  const fetchPending = async () => {
    try {
      const data = await api.getPendingReservations();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar pedidos pendentes:', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...requests];

    // Filtro de texto
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(req =>
        req.solicitante.nome.toLowerCase().includes(searchLower) ||
        req.sala.nome.toLowerCase().includes(searchLower) ||
        req.sala.edificio.toLowerCase().includes(searchLower) ||
        req.proposito.toLowerCase().includes(searchLower)
      );
    }

    // Ordenação
    if (filters.sortBy === 'maisAntigos') {
      filtered.sort((a, b) => new Date(a.dataSubmissao) - new Date(b.dataSubmissao));
    } else if (filters.sortBy === 'proximos') {
      filtered.sort((a, b) => new Date(a.data) - new Date(b.data));
    }

    setFilteredRequests(filtered);
  }, [filters, requests]);

  const handleApprove = async (requestId) => {
    if (window.confirm('Tem certeza que deseja aprovar esta reserva?')) {
      try {
        const result = await api.approveReservation(requestId);
        if (result?.detail) {
          alert(result.detail);
          return;
        }
        setRequests(prev => prev.filter(req => req.id !== requestId));
        alert('Reserva aprovada com sucesso!');
      } catch (error) {
        console.error('Erro ao aprovar:', error);
        alert('Erro ao aprovar reserva. Tente novamente.');
      }
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      alert('Selecione pelo menos uma reserva para aprovar');
      return;
    }

    if (window.confirm(`Aprovar ${selectedRequests.length} reserva(s)?`)) {
      try {
        const results = await Promise.all(
          selectedRequests.map(id => api.approveReservation(id))
        );
        const approvedIds = selectedRequests.filter((id, idx) => !results[idx]?.detail);
        setRequests(prev => prev.filter(req => !approvedIds.includes(req.id)));
        setSelectedRequests([]);
        alert(`${approvedIds.length} reserva(s) aprovada(s) com sucesso!`);
      } catch (error) {
        console.error('Erro ao aprovar em lote:', error);
        alert('Erro ao aprovar reservas. Tente novamente.');
      }
    }
  };

  const handleRejectClick = (request) => {
    setCurrentRejectRequest(request);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectionReason.trim()) {
      alert('Por favor, forneça um motivo para a rejeição.');
      return;
    }

    try {
      await api.rejectReservation(currentRejectRequest.id, rejectionReason);
      setRequests(prev => prev.filter(req => req.id !== currentRejectRequest.id));
      setShowRejectModal(false);
      setRejectionReason('');
      setCurrentRejectRequest(null);
      alert('Reserva rejeitada. O solicitante será notificado.');
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      alert('Erro ao rejeitar reserva. Tente novamente.');
    }
  };

  const toggleSelectRequest = (requestId) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map(req => req.id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('pt-PT');
  };

  const getPrioridadeBadge = (prioridade) => {
    if (prioridade === 'alta') {
      return <span className="priority-badge high"><FaExclamationTriangle /> Alta Prioridade</span>;
    }
    return null;
  };

  return (
    <div className="secretariat-page">
      <div className="page-header">
        <h2>Pedidos Pendentes</h2>
        <div className="pending-counter">
          <span className="counter-badge">{filteredRequests.length}</span>
          <span>pedido(s) aguardando aprovação</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por solicitante, sala, edifício..."
            value={filters.searchText}
            onChange={(e) => setFilters({...filters, searchText: e.target.value})}
          />
        </div>

        <div className="filter-group">
          <FaFilter />
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
          >
            <option value="maisAntigos">Mais antigos primeiro</option>
            <option value="proximos">Próximos primeiro</option>
          </select>
        </div>

        {selectedRequests.length > 0 && (
          <button className="btn-bulk-approve" onClick={handleBulkApprove}>
            <FaCheckDouble /> Aprovar Selecionados ({selectedRequests.length})
          </button>
        )}
      </div>

      {/* Tabela de Pedidos */}
      <div className="requests-table-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando pedidos...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h3>Não há solicitações pendentes no momento</h3>
            <p>Todos os pedidos foram processados.</p>
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={selectedRequests.length === filteredRequests.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>Solicitante</th>
                <th>Sala</th>
                <th>Data e Hora</th>
                <th>Duração</th>
                <th>Propósito</th>
                <th>Submissão</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr key={request.id} className={selectedRequests.includes(request.id) ? 'selected' : ''}>
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => toggleSelectRequest(request.id)}
                    />
                  </td>
                  <td>
                    <div className="solicitante-info">
                      <strong>{request.solicitante.nome}</strong>
                      <small>{request.solicitante.email}</small>
                      {getPrioridadeBadge(request.prioridade)}
                    </div>
                  </td>
                  <td>
                    <div className="sala-info">
                      <strong>{request.sala.nome}</strong>
                      <small><FaBuilding /> {request.sala.edificio}</small>
                    </div>
                  </td>
                  <td>
                    <div className="date-time-info">
                      <strong>{formatDate(request.data)}</strong>
                      <small>{request.horaInicio} - {request.horaFim}</small>
                    </div>
                  </td>
                  <td>{request.duracao}</td>
                  <td>
                    <div className="proposito-info" title={request.proposito}>
                      {request.proposito.length > 50
                        ? request.proposito.substring(0, 50) + '...'
                        : request.proposito}
                    </div>
                  </td>
                  <td>
                    <small>{formatDateTime(request.dataSubmissao)}</small>
                  </td>
                  <td className="actions-col">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(request.id)}
                      title="Aprovar"
                    >
                      <FaCheck />
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleRejectClick(request)}
                      title="Rejeitar"
                    >
                      <FaTimes />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Rejeição */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rejeitar Reserva</h3>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>Solicitante:</strong> {currentRejectRequest?.solicitante.nome}</p>
              <p><strong>Sala:</strong> {currentRejectRequest?.sala.nome}</p>
              <p><strong>Data:</strong> {currentRejectRequest?.data}</p>

              <label className="rejection-label">
                <strong>Motivo da rejeição *</strong>
                <textarea
                  className="rejection-textarea"
                  rows="4"
                  placeholder="Explique o motivo pelo qual esta reserva está sendo rejeitada..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowRejectModal(false)}>
                Cancelar
              </button>
              <button className="btn-confirm-reject" onClick={handleRejectConfirm}>
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequests;