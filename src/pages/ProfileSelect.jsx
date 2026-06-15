// src/pages/ProfileSelect.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROFILE_META, applyRole } from '../services/auth';
import '../styles/login.css';

// Mostrada após o login quando o utilizador tem 2 ou mais perfis.
const ProfileSelect = () => {
  const navigate = useNavigate();

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }
  const profiles = user?.profiles || [];

  // Sem sessão → login. Com 0/1 perfil → entra direto (não há nada para escolher).
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    } else if (profiles.length < 2) {
      const enriched = applyRole(user, profiles[0] || 'convidado');
      navigate(enriched.defaultPage, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user || profiles.length < 2) return null;

  const pick = (role) => {
    const enriched = applyRole(user, role);
    navigate(enriched.defaultPage, { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>

        <div className="login-box">
          <div className="login-header">
            <h1>Escolher Perfil</h1>
            <p>{user.name || user.email}</p>
          </div>

          <p className="profile-select-hint">
            A sua conta tem vários perfis. Selecione com qual deseja entrar:
          </p>

          <div className="profile-select-grid">
            {profiles.map((p) => {
              const meta = PROFILE_META[p] || { label: p, icon: '👤', description: '' };
              return (
                <button key={p} className="profile-select-card" onClick={() => pick(p)}>
                  <span className="profile-select-icon">{meta.icon}</span>
                  <span className="profile-select-label">{meta.label}</span>
                  <small className="profile-select-desc">{meta.description}</small>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelect;
