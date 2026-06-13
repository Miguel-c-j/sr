import { useState } from 'react';
import {
  FaUpload,
  FaTrash,
  FaFileCsv,
  FaDownload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';
import '../../styles/secretariat.css';

const ImportData = () => {
  const [importType, setImportType] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const importTypes = [
    { id: 'horarios_aulas', label: 'Horários de Aulas', description: 'Importar horários regulares de aulas' },
    { id: 'horarios_exames', label: 'Horários de Exames', description: 'Importar períodos de exames' },
    { id: 'calendario_letivo', label: 'Calendário Letivo', description: 'Importar calendário acadêmico' }
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
    } else {
      alert('Por favor, selecione um arquivo CSV válido.');
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      alert('Por favor, selecione um arquivo CSV válido.');
    }
  };

  const handleImport = async () => {
    if (!importType) {
      alert('Por favor, selecione o tipo de importação.');
      return;
    }

    if (!file) {
      alert('Por favor, selecione um arquivo CSV.');
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    // Simular processo de importação
    setTimeout(() => {
      const mockResult = {
        success: true,
        totalRecords: 245,
        successCount: 238,
        errorCount: 7,
        errors: [
          { row: 15, message: 'Formato de data inválido' },
          { row: 42, message: 'Sala não encontrada' },
          { row: 78, message: 'Horário sobreposto' },
          { row: 103, message: 'Capacidade excedida' },
          { row: 156, message: 'Formato de hora inválido' },
          { row: 189, message: 'Edifício não encontrado' },
          { row: 201, message: 'Professor não encontrado' }
        ]
      };

      setImportResult(mockResult);
      setIsUploading(false);
    }, 3000);
  };

  const handleClear = () => {
    setImportType('');
    setFile(null);
    setImportResult(null);
  };

  const downloadTemplate = (type) => {
    // Mock download - será implementado com arquivos reais
    alert(`Download do template para ${type} iniciado...`);
  };

  return (
    <div className="secretariat-page">
      <div className="page-header">
        <h2>Novo Import</h2>
        <p className="page-description">
          Importe dados em massa a partir de ficheiros CSV
        </p>
      </div>

      <div className="import-container">
        <div className="import-form">
          {/* Tipo de Importação */}
          <div className="form-group">
            <label>
              Tipo de Importação <span className="required-star">*</span>
            </label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              className="import-select"
            >
              <option value="">Selecione o tipo</option>
              {importTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Upload de Ficheiro */}
          <div className="form-group">
            <label>
              Ficheiro CSV <span className="required-star">*</span>
            </label>
            <div
              className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'file-selected' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                type="file"
                id="fileInput"
                accept=".csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {file ? (
                <div className="file-info">
                  <FaFileCsv className="file-icon" />
                  <div className="file-details">
                    <strong>{file.name}</strong>
                    <small>{(file.size / 1024).toFixed(2)} KB</small>
                  </div>
                  <button
                    className="remove-file"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <FaUpload className="upload-icon" />
                  <p>Clique para selecionar ou arraste o ficheiro</p>
                  <small>Formatos aceites: CSV (UTF-8)</small>
                </>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="form-actions">
            <button
              className="btn-import"
              onClick={handleImport}
              disabled={!importType || !file || isUploading}
            >
              {isUploading ? (
                <>
                  <FaSpinner className="spinning" /> A processar...
                </>
              ) : (
                <>
                  <FaUpload /> Importar
                </>
              )}
            </button>
            <button className="btn-clear" onClick={handleClear}>
              <FaTrash /> Limpar
            </button>
          </div>
        </div>

        {/* Resultado da Importação */}
        {importResult && (
          <div className={`import-result ${importResult.success ? 'success' : 'partial'}`}>
            <div className="result-header">
              {importResult.successCount === importResult.totalRecords ? (
                <FaCheckCircle className="result-icon success" />
              ) : (
                <FaExclamationTriangle className="result-icon warning" />
              )}
              <h3>Resultado da Importação</h3>
            </div>

            <div className="result-stats">
              <div className="stat">
                <span className="stat-label">Total de registos:</span>
                <span className="stat-value">{importResult.totalRecords}</span>
              </div>
              <div className="stat success">
                <span className="stat-label">Importados com sucesso:</span>
                <span className="stat-value">{importResult.successCount}</span>
              </div>
              <div className="stat error">
                <span className="stat-label">Falhas:</span>
                <span className="stat-value">{importResult.errorCount}</span>
              </div>
            </div>

            {importResult.errorCount > 0 && (
              <div className="error-list">
                <h4>Detalhe dos Erros:</h4>
                <table className="errors-table">
                  <thead>
                    <tr>
                      <th>Linha</th>
                      <th>Erro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResult.errors.map((error, idx) => (
                      <tr key={idx}>
                        <td>{error.row}</td>
                        <td>{error.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Templates Disponíveis */}
        <div className="templates-section">
          <h3>Templates de Importação</h3>
          <p className="templates-description">
            Descarregue os templates com a estrutura esperada para cada tipo de importação:
          </p>
          <div className="templates-grid">
            {importTypes.map(type => (
              <div key={type.id} className="template-card">
                <FaFileCsv className="template-icon" />
                <div className="template-info">
                  <strong>{type.label}</strong>
                  <small>{type.description}</small>
                </div>
                <button
                  className="btn-download"
                  onClick={() => downloadTemplate(type.label)}
                >
                  <FaDownload /> Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportData;