/**
 * Servicio de autenticación - Comunicación con el backend
 * Maneja login, registro y gestión de tokens JWT
 */

import apiService from './api';

export interface LoginCredentials {
  user: string;  // Email
  pswd: string;  // Password
}

export interface RegisterCredentials {
  user: string;  // Email
  pswd: string;  // Password
  name?: string; // Nombre del usuario (opcional para el backend)
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: string;
  name?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    // Validación en el cliente - debe coincidir con el backend
    if (!credentials.user || !credentials.pswd) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Validar email: formato básico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(credentials.user)) {
      throw new Error('Formato de email inválido');
    }

    // Validar contraseña: 8-32 caracteres
    if (credentials.pswd.length < 8 || credentials.pswd.length > 32) {
      throw new Error('La contraseña debe tener entre 8 y 32 caracteres');
    }
    const passwordRegex = /^[a-zA-Z0-9_]+$/;
    if (!passwordRegex.test(credentials.pswd)) {
      throw new Error('La contraseña solo puede contener letras, números y guiones bajos');
    }
    if (!/[a-zA-Z]/.test(credentials.pswd)) {
      throw new Error('La contraseña debe incluir al menos una letra');
    }
    if (!/[0-9]/.test(credentials.pswd)) {
      throw new Error('La contraseña debe incluir al menos un número');
    }

    const response = await apiService.post<AuthResponse>('/login', credentials);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al iniciar sesión');
    }

    const { access_token, user, name } = response.data;
    
    // Guardar token en el servicio API
    apiService.setToken(access_token);

    // Crear objeto de usuario usando el nombre del backend o generando uno del email
    const userObj: User = {
      id: Math.random().toString(36).substr(2, 9), // Generamos un ID local
      email: user,
      name: name || user.split('@')[0], // Usar nombre del backend o parte del email
    };

    return { token: access_token, user: userObj };
  }

  async register(credentials: RegisterCredentials): Promise<{ token: string; user: User }> {
    // Validación en el cliente - debe coincidir con el backend
    if (!credentials.user || !credentials.pswd) {
      throw new Error('Email y contraseña son requeridos');
    }

    // Validar email: formato básico
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(credentials.user)) {
      throw new Error('Formato de email inválido');
    }

    // Validar contraseña: 8-32 caracteres
    if (credentials.pswd.length < 8 || credentials.pswd.length > 32) {
      throw new Error('La contraseña debe tener entre 8 y 32 caracteres');
    }
    const passwordRegex = /^[a-zA-Z0-9_]+$/;
    if (!passwordRegex.test(credentials.pswd)) {
      throw new Error('La contraseña solo puede contener letras, números y guiones bajos');
    }
    if (!/[a-zA-Z]/.test(credentials.pswd)) {
      throw new Error('La contraseña debe incluir al menos una letra');
    }
    if (!/[0-9]/.test(credentials.pswd)) {
      throw new Error('La contraseña debe incluir al menos un número');
    }

    const response = await apiService.post<AuthResponse>('/register', credentials);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al registrar usuario');
    }

    const { access_token, user, name } = response.data;
    
    // Guardar token
    apiService.setToken(access_token);

    // Crear objeto de usuario
    const userObj: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: user,
      name: name || credentials.name || user.split('@')[0],
    };

    return { token: access_token, user: userObj };
  }

  logout(): void {
    apiService.setToken(null);
    localStorage.removeItem('ciceron_user');
  }

  getToken(): string | null {
    return apiService.getToken();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
}

export const authService = new AuthService();
export default authService;
