const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function login(email: string, senha: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(Array.isArray(err.message) ? err.message[0] : err.message || 'E-mail ou senha inválidos');
  }
  return res.json();
}
