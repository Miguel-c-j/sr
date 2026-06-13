// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaUserTag, FaSignInAlt, FaUniversity } from 'react-icons/fa';
import '../styles/login.css';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('aluno');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Perfis disponíveis
  const profiles = [
    { id: 'convidado', label: 'Convidado', icon: '👤', description: 'Acesso limitado apenas para visualização' },
    { id: 'aluno', label: 'Aluno', icon: '🎓', description: 'Pode reservar salas para estudo' },
    { id: 'docente', label: 'Docente', icon: '👨‍🏫', description: 'Prioridade nas reservas' },
    { id: 'secretariado', label: 'Secretariado', icon: '📋', description: 'Aprova reservas e gere conflitos' },
    { id: 'administrador', label: 'Administrador', icon: '⚙️', description: 'Acesso total ao sistema' }
  ];

  // Definir página inicial baseada no perfil
  const getDefaultPage = (role) => {
    switch (role) {
      case 'administrador':
        return '/gerir-salas';
      case 'secretariado':
        return '/pendentes';
      case 'docente':
      case 'aluno':
      case 'convidado':
      default:
        return '/salas';
    }
  };

  const validateEmail = (email) => {
    const alunoPattern = /^[a-zA-Z0-9._-]+@alunos\.uevora\.pt$/;
    const professorPattern = /^[a-zA-Z0-9._-]+@uevora\.pt$/;
    return alunoPattern.test(email) || professorPattern.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Por favor, insira o seu email institucional.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, utilize um email institucional válido (@uevora.pt ou @alunos.uevora.pt)');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const defaultPage = getDefaultPage(role);

      const userData = {
        email: email,
        role: role,
        name: getDisplayName(email, role),
        permissions: getPermissionsByRole(role),
        buildingAccess: role === 'secretariado' ? [1, 2, 3, 4] : [],
        defaultPage: defaultPage,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('user', JSON.stringify(userData));

      if (onLogin) {
        onLogin(userData);
      }

      setIsLoading(false);
      navigate(defaultPage); // Redirecionar para a página correta
    }, 1500);
  };

  const getDisplayName = (email, role) => {
    const name = email.split('@')[0];
    const formattedName = name.split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');

    const roleNames = {
      convidado: 'Visitante',
      aluno: 'Aluno',
      docente: 'Prof.',
      secretariado: 'Secretariado',
      administrador: 'Admin'
    };

    return `${roleNames[role]} ${formattedName}`;
  };

  const getPermissionsByRole = (role) => {
    const permissions = {
      convidado: ['ver_reservas'],
      aluno: ['reservar', 'ver_reservas'],
      docente: ['reservar', 'ver_reservas', 'prioridade'],
      secretariado: ['aprovar_pendentes', 'gerir_conflitos', 'importar_dados'],
      administrador: ['gerir_salas', 'gerir_equipamentos', 'gerir_edificios', 'gerir_utilizadores']
    };
    return permissions[role] || permissions.convidado;
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>

        <div className="login-box">
          <div className="login-header">
            <div className="university-icon">
              <FaUniversity />
            </div>
            <h1>Sistema de Reservas</h1>
            <p>Universidade de Évora</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <div className="form-group">
              <label>
                <FaEnvelope className="input-icon" />
                Email Institucional
              </label>
              <input
                type="email"
                placeholder="exemplo@uevora.pt ou @alunos.uevora.pt"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value.includes('@alunos.uevora.pt')) {
                    setRole('aluno');
                  } else if (e.target.value.includes('@uevora.pt')) {
                    setRole('docente');
                  }
                }}
                className="login-input"
                required
              />
              <small className="input-hint">
                Utilize o seu email institucional (@uevora.pt ou @alunos.uevora.pt)
              </small>
            </div>

            <div className="form-group">
              <label>
                <FaUserTag className="input-icon" />
                Perfil de Acesso
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="login-select"
              >
                {profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.icon} {profile.label} - {profile.description}
                  </option>
                ))}
              </select>
              <small className="input-hint">
                Selecione o perfil com que deseja aceder ao sistema
              </small>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner-small"></div>
                  A autenticar...
                </>
              ) : (
                <>
                  <FaSignInAlt /> Entrar no Sistema
                </>
              )}
            </button>

            <div className="login-info">
              <p className="info-title">ℹ️ Informação de Demonstração</p>
              <p>Este é um sistema de demonstração. Utilize qualquer email válido do domínio @uevora.pt ou @alunos.uevora.pt</p>
              <div className="demo-emails">
                <small>Exemplos:</small>
                <code>admin@uevora.pt (Admin)</code>
                <code>secretariado@uevora.pt (Secretariado)</code>
                <code>professor@uevora.pt (Docente)</code>
                <code>aluno@alunos.uevora.pt (Aluno)</code>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;