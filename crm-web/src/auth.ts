const TOKEN_KEY = 'crm_token';
const USER_KEY = 'crm_user';

export type Usuario = { id: string; email: string; nome: string; role: string };

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): Usuario | null {
  const s = localStorage.getItem(USER_KEY);
  return s ? (JSON.parse(s) as Usuario) : null;
}

export function setAuth(access_token: string, usuario: Usuario) {
  localStorage.setItem(TOKEN_KEY, access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
