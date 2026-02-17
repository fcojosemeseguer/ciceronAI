/**
 * Servicio API base para comunicación con el backend
 * Configuración centralizada de fetch con manejo de errores y autenticación
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

class ApiService {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('ciceron_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('ciceron_token', token);
    } else {
      localStorage.removeItem('ciceron_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // El backend espera el token en el body para POST requests
    // No lo enviamos en headers
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Intentar parsear JSON, pero manejar respuestas vacías
      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        // Manejar errores de FastAPI que pueden venir como array de objetos
        let errorMessage = data.message || `Error ${response.status}: ${response.statusText}`;

        if (data.detail) {
          if (Array.isArray(data.detail)) {
            // Errores de validación de Pydantic
            errorMessage = data.detail.map((err: any) => {
              if (typeof err === 'string') return err;
              if (err.msg) return err.msg;
              return JSON.stringify(err);
            }).join(', ');
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (data.detail.msg) {
            errorMessage = data.detail.msg;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // No incluimos Content-Type, fetch lo establece automáticamente con el boundary correcto
      });

      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        // Manejar errores de FastAPI que pueden venir como array de objetos
        let errorMessage = data.message || `Error ${response.status}: ${response.statusText}`;

        if (data.detail) {
          if (Array.isArray(data.detail)) {
            // Errores de validación de Pydantic
            errorMessage = data.detail.map((err: any) => {
              if (typeof err === 'string') return err;
              if (err.msg) return err.msg;
              return JSON.stringify(err);
            }).join(', ');
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (data.detail.msg) {
            errorMessage = data.detail.msg;
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
export default apiService;
