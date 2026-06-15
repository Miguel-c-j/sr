// src/services/auth.js
// Lógica partilhada de perfis/sessão usada pelo login e pela seleção de perfil.

// Metadados de cada perfil (rótulo + ícone) para mostrar na UI.
export const PROFILE_META = {
  convidado:     { label: 'Convidado',     icon: '👤', description: 'Acesso limitado apenas para visualização' },
  aluno:         { label: 'Aluno',         icon: '🎓', description: 'Pode reservar salas para estudo' },
  docente:       { label: 'Docente',       icon: '👨‍🏫', description: 'Prioridade nas reservas' },
  secretariado:  { label: 'Secretariado',  icon: '📋', description: 'Aprova reservas e gere conflitos' },
  administrador: { label: 'Administrador', icon: '⚙️', description: 'Acesso total ao sistema' },
};

// Ordem de prioridade quando é preciso escolher um perfil principal automaticamente.
export const ROLE_PRIORITY = ['administrador', 'secretariado', 'docente', 'aluno', 'convidado'];

export const getPrimaryRole = (profiles = []) =>
  ROLE_PRIORITY.find(role => profiles.includes(role)) || 'convidado';

// Página inicial conforme o perfil ativo.
export const getDefaultPage = (role) => {
  switch (role) {
    case 'administrador': return '/gerir-salas';
    case 'secretariado':  return '/pendentes';
    default:              return '/salas';   // docente / aluno / convidado
  }
};

export const getPermissionsByRole = (role) => {
  const permissions = {
    convidado: ['ver_reservas'],
    aluno: ['reservar', 'ver_reservas'],
    docente: ['reservar', 'ver_reservas', 'prioridade'],
    secretariado: ['aprovar_pendentes', 'gerir_conflitos', 'importar_dados'],
    administrador: ['gerir_salas', 'gerir_equipamentos', 'gerir_edificios', 'gerir_utilizadores'],
  };
  return permissions[role] || permissions.convidado;
};

// Grava o utilizador na sessão com o perfil ativo escolhido e devolve a página inicial.
export const applyRole = (user, role) => {
  const enriched = {
    ...user,
    role,
    permissions: getPermissionsByRole(role),
    defaultPage: getDefaultPage(role),
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem('user', JSON.stringify(enriched));
  return enriched;
};
