/**
 * Auth Store - Gestión de autenticación con JWT (Integración con Backend Real)
 * Maneja login, registro, y validación de tokens
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { authService, User } from '../services/authService';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  clearError: () => void;
}

// Validar token JWT
const isTokenValid = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

// Cargar estado inicial desde localStorage
const loadInitialState = (): Partial<AuthState> => {
  const token = localStorage.getItem('ciceron_token');
  const userStr = localStorage.getItem('ciceron_user');
  
  if (token && userStr) {
    try {
      if (isTokenValid(token)) {
        const user = JSON.parse(userStr);
        return { token, user, isAuthenticated: true };
      } else {
        // Token expirado, limpiar
        localStorage.removeItem('ciceron_token');
        localStorage.removeItem('ciceron_user');
      }
    } catch {
      localStorage.removeItem('ciceron_token');
      localStorage.removeItem('ciceron_user');
    }
  }
  
  return { user: null, token: null, isAuthenticated: false };
};

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    ...loadInitialState(),

    // Login
    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const { token, user } = await authService.login({
          user: email,
          pswd: password
        });
        
        // Guardar en localStorage
        localStorage.setItem('ciceron_token', token);
        localStorage.setItem('ciceron_user', JSON.stringify(user));
        
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        return true;
      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Error al iniciar sesión',
          isAuthenticated: false,
        });
        return false;
      }
    },

    // Register
    register: async (name: string, email: string, password: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const { token, user } = await authService.register({
          user: email,
          pswd: password,
          name
        });
        
        // Actualizar el nombre del usuario con el proporcionado
        const userWithName = { ...user, name };
        
        localStorage.setItem('ciceron_token', token);
        localStorage.setItem('ciceron_user', JSON.stringify(userWithName));
        
        set({
          token,
          user: userWithName,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        return true;
      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Error al registrarse',
          isAuthenticated: false,
        });
        return false;
      }
    },

    // Logout
    logout: () => {
      authService.logout();
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    },

    // Check auth status
    checkAuth: () => {
      const { token } = get();
      
      if (!token) {
        set({ isAuthenticated: false, user: null });
        return false;
      }
      
      if (!isTokenValid(token)) {
        get().logout();
        return false;
      }
      
      return true;
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },
  }))
);

// Hook para obtener el token en las peticiones API
export const getAuthToken = (): string | null => {
  return localStorage.getItem('ciceron_token');
};

export default useAuthStore;
