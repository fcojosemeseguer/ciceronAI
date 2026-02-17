/**
 * Servicio de proyectos - Gestión de debates/proyectos
 * Comunicación con el backend para crear, listar y obtener proyectos
 */

import apiService from './api';
import apiServiceV2 from './apiV2';

export interface CreateProjectData {
  name: string;
  description: string;
  format_type?: string;
}

export interface Project {
  project_code: string;
  name: string;
  description: string;
  created_at: string;
  user_code: string;
  format_type?: string;
}

export interface DebateFormat {
  codigo: string;
  nombre: string;
  descripcion: string;
  num_fases: number;
}

export interface CreateProjectResponse {
  message: string;
  project_code: string;
}

export interface GetProjectsResponse {
  message: string;
  result: Project[];
}

export interface GetProjectResponse {
  message: string;
  content: Project;
}

class ProjectService {
  async getFormats(): Promise<DebateFormat[]> {
    const response = await apiServiceV2.get<DebateFormat[]>('/formats');
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener los formatos');
    }
    
    return response.data;
  }

  async createProject(data: CreateProjectData): Promise<{ projectCode: string; name: string; description: string; format_type: string }> {
    const token = apiServiceV2.getToken();
    
    if (!token) {
      throw new Error('No hay sesión activa. Por favor, inicia sesión.');
    }

    const response = await apiServiceV2.post<CreateProjectResponse>('/projects', {
      jwt: token,
      name: data.name,
      description: data.description,
      format_type: data.format_type || 'UPCT'
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al crear el proyecto');
    }

    return {
      projectCode: response.data.project_code,
      name: data.name,
      description: data.description,
      format_type: data.format_type || 'UPCT'
    };
  }

  async getProjects(): Promise<Project[]> {
    const token = apiService.getToken();
    
    if (!token) {
      throw new Error('No hay sesión activa. Por favor, inicia sesión.');
    }

    const response = await apiService.post<GetProjectsResponse>('/get-projects', {
      jwt: token,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener los proyectos');
    }

    return response.data.result || [];
  }

  async getProject(projectCode: string): Promise<Project> {
    const token = apiService.getToken();
    
    if (!token) {
      throw new Error('No hay sesión activa. Por favor, inicia sesión.');
    }

    const response = await apiService.post<GetProjectResponse>('/get-project', {
      jwt: token,
      project_code: projectCode,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener el proyecto');
    }

    return response.data.content;
  }
}

export const projectService = new ProjectService();
export default projectService;
