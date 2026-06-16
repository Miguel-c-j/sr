// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { FaUniversity } from 'react-icons/fa';
import api from '../services/api';
import { applyRole, getPrimaryRole } from '../services/auth';
import '../styles/login.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  // Login com Google (email institucional): recebe o ID token e envia-o ao backend.
  // Em caso de falha, fica na página e mostra a mensagem de erro.
  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setIsLoading(true);
    try {
      const { ok, data } = await api.loginWithGoogle(credentialResponse.credential);
      if (!ok) {
        setError(data.detail || 'A autenticação falhou. Tente novamente.');
        return;
      }
      finalizeLogin(data.user);
    } catch (err) {
      console.error('Erro no login Google:', err);
      setError('Erro de ligação ao servidor. Verifique se o backend está a correr.');
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

          <div className="login-form">
            {error && (
              <div className="error-message">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <p className="login-instruction">
              Inicie sessão com o seu email institucional Google
              (@uevora.pt ou @alunos.uevora.pt).
            </p>

            {/* Único acesso ao sistema: login com Google */}
            {GOOGLE_CLIENT_ID ? (
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('A autenticação com o Google falhou.')}
                  text="signin_with"
                  locale="pt-PT"
                  width="280"
                />
                {isLoading && (
                  <div className="login-loading">
                    <div className="spinner-small"></div>
                    A autenticar...
                  </div>
                )}
              </div>
            ) : (
              <div className="login-info">
                <p className="info-title">ℹ️ Login Google não configurado</p>
                <p>Define <code>VITE_GOOGLE_CLIENT_ID</code> (frontend) e <code>GOOGLE_CLIENT_ID</code> (backend) para ativar o acesso.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
