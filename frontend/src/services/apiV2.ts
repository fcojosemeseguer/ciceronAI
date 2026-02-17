/**
 * Servicio API V2 para comunicación con el backend
 * Configuración para endpoints de la versión 2 (formatos de debate)
 */

const API_V2_BASE_URL = process.env.REACT_APP_API_V2_URL || 'http://localhost:5000/api/v2';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

class ApiServiceV2 {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_V2_BASE_URL;
  }

  getToken(): string | null {
    return localStorage.getItem('ciceron_token');
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

    try {
      const response = await fetch(url, {
        ...options,
        headers,
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
        let errorMessage = data.message || `Error ${response.status}: ${response.statusText}`;

        if (data.detail) {
          if (Array.isArray(data.detail)) {
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
      console.error('API V2 request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}

export const apiServiceV2 = new ApiServiceV2();
export default apiServiceV2;
