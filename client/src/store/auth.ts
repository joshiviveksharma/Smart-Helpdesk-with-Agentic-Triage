import { create } from 'zustand';

type AuthState = {
  token: string | null;
  role: string | null;
  setToken: (token: string) => void;
  logout: () => void;
};

function decodeRole(token: string): string | null {
  try {
    const [, payloadB64] = token.split('.');
    const json = JSON.parse(atob(payloadB64));
    return json.role || null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  role: localStorage.getItem('token') ? decodeRole(localStorage.getItem('token')!) : null,
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token, role: decodeRole(token) });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, role: null });
  }
}));


