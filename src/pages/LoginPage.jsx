// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FaEnvelope, FaSignInAlt, FaUniversity } from 'react-icons/fa';
import api from '../services/api';
import { applyRole, getPrimaryRole } from '../services/auth';
import '../styles/login.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value) => {
    const alunoPattern = /^[a-zA-Z0-9._-]+@alunos\.uevora\.pt$/;
    const professorPattern = /^[a-zA-Z0-9._-]+@uevora\.pt$/;
    return alunoPattern.test(value) || professorPattern.test(value);
  };

  // Decide para onde ir após autenticar: se o utilizador tiver 2+ perfis,
  // mostra a página de seleção; caso contrário entra direto.
  const finalizeLogin = (user) => {
    const profiles = user?.profiles || [];

    if (profiles.length >= 2) {
      // Guarda o utilizador sem perfil ativo definido; a seleção define-o.
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/selecionar-perfil');
      return;
    }

    const role = profiles[0] || getPrimaryRole(profiles);
    const enriched = applyRole(user, role);
    if (onLogin) onLogin(enriched);
    navigate(enriched.defaultPage);
  };

  // Login por email institucional (sem password)
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
    try {
      const { ok, data } = await api.login(email);
      if (!ok) {
        setError(data.detail || 'Não foi possível autenticar. Tente novamente.');
        return;
      }
      finalizeLogin(data.user);
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro de ligação ao servidor. Verifique se o backend está a correr.');
    } finally {
      setIsLoading(false);
    }
  };

  // Login com Google: recebe o ID token e envia-o ao backend
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setIsLoading(true);
    try {
      const { ok, data } = await api.loginWithGoogle(credentialResponse.credential);
      if (!ok) {
        setError(data.detail || 'Não foi possível autenticar com o Google.');
        return;
      }
      finalizeLogin(data.user);
    } catch (err) {
      console.error('Erro no login Google:', err);
      setError('Erro de ligação ao servidor.');
    } finally {
      setIsLoading(false);
    }
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

            {/* Login com Google */}
            {GOOGLE_CLIENT_ID ? (
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Falha na autenticação com o Google.')}
                  text="signin_with"
                  locale="pt-PT"
                  width="280"
                />
              </div>
            ) : (
              <div className="login-info" style={{ marginBottom: '1rem' }}>
                <p className="info-title">ℹ️ Login Google não configurado</p>
                <p>Define <code>VITE_GOOGLE_CLIENT_ID</code> (frontend) e <code>GOOGLE_CLIENT_ID</code> (backend) para ativar.</p>
              </div>
            )}

            <div className="login-divider"><span>ou</span></div>

            {/* Login por email institucional */}
            <div className="form-group">
              <label>
                <FaEnvelope className="input-icon" />
                Email Institucional
              </label>
              <input
                type="email"
                placeholder="exemplo@uevora.pt ou @alunos.uevora.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
              />
              <small className="input-hint">
                Utilize o seu email institucional (@uevora.pt ou @alunos.uevora.pt)
              </small>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
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
              <p>Utilize qualquer email válido do domínio @uevora.pt ou @alunos.uevora.pt</p>
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
