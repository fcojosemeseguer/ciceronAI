/**
 * Project Store - Gestión de proyectos/debates con integración al backend
 * Reemplaza debateHistoryStore para usar la API real
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { projectService, Project, DebateFormat } from '../services/projectService';
import { DebateHistory, TeamPosition, TeamScore } from '../types';

export interface ProjectState {
  projects: DebateHistory[];
  currentProjectCode: string | null;
  isLoading: boolean;
  error: string | null;
  availableFormats: DebateFormat[];
  formatsLoading: boolean;
}

interface ProjectStore extends ProjectState {
  // Actions
  loadProjects: () => Promise<void>;
  loadFormats: () => Promise<void>;
  createProject: (name: string, description: string, debateConfig: {
    teamAName: string;
    teamBName: string;
    debateTopic: string;
    formatType?: string;
  }) => Promise<string>;
  deleteProject: (projectId: string) => void;
  setCurrentProject: (projectCode: string | null) => void;
  getProjectById: (projectId: string) => DebateHistory | undefined;
  clearError: () => void;
  
  // Mapeo entre formato backend y frontend
  mapProjectToDebateHistory: (project: Project) => DebateHistory;
}

// Función auxiliar para mapear proyectos del backend al formato del frontend
const mapProjectToDebateHistory = (project: Project): DebateHistory => {
  return {
    id: project.project_code,
    date: project.created_at || new Date().toISOString(),
    topic: project.name,
    teamAName: 'Equipo A', // Estos datos vendrían de la descripción o análisis
    teamBName: 'Equipo B',
    winner: 'draw', // Por defecto, se actualizaría con el análisis
    scores: [],
    duration: 0,
    summary: project.description || '',
    recordingsCount: 0,
  };
};

export const useProjectStore = create<ProjectStore>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    projects: [],
    currentProjectCode: localStorage.getItem('ciceron_current_project'),
    isLoading: false,
    error: null,
    availableFormats: [],
    formatsLoading: false,

    // Cargar proyectos del backend
    loadProjects: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const projects = await projectService.getProjects();
        const debateHistories = projects.map(mapProjectToDebateHistory);
        
        set({
          projects: debateHistories,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Error al cargar los proyectos',
        });
      }
    },

    // Cargar formatos disponibles
    loadFormats: async () => {
      set({ formatsLoading: true, error: null });
      
      try {
        const formats = await projectService.getFormats();
        
        set({
          availableFormats: formats,
          formatsLoading: false,
          error: null,
        });
      } catch (error: any) {
        set({
          formatsLoading: false,
          error: error.message || 'Error al cargar los formatos',
        });
      }
    },

    // Crear nuevo proyecto en el backend
    createProject: async (name: string, description: string, debateConfig: {
      teamAName: string;
      teamBName: string;
      debateTopic: string;
      formatType?: string;
    }) => {
      set({ isLoading: true, error: null });
      
      try {
        // Creamos el proyecto en el backend
        const result = await projectService.createProject({
          name: debateConfig.debateTopic || name,
          description: JSON.stringify({
            teamAName: debateConfig.teamAName,
            teamBName: debateConfig.teamBName,
            originalName: name,
          }),
          format_type: debateConfig.formatType || 'UPCT',
        });

        // Guardamos el código del proyecto actual
        localStorage.setItem('ciceron_current_project', result.projectCode);
        
        // Actualizamos el estado
        const newDebate: DebateHistory = {
          id: result.projectCode,
          date: new Date().toISOString(),
          topic: debateConfig.debateTopic || name,
          teamAName: debateConfig.teamAName,
          teamBName: debateConfig.teamBName,
          winner: 'draw',
          scores: [],
          duration: 0,
          summary: description,
          recordingsCount: 0,
        };

        set((state) => ({
          projects: [newDebate, ...state.projects],
          currentProjectCode: result.projectCode,
          isLoading: false,
          error: null,
        }));

        return result.projectCode;
      } catch (error: any) {
        set({
          isLoading: false,
          error: error.message || 'Error al crear el proyecto',
        });
        throw error;
      }
    },

    // Eliminar proyecto (solo local por ahora, el backend no tiene endpoint para eliminar)
    deleteProject: (projectId: string) => {
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
      }));
      
      // Si eliminamos el proyecto actual, limpiamos
      if (get().currentProjectCode === projectId) {
        localStorage.removeItem('ciceron_current_project');
        set({ currentProjectCode: null });
      }
    },

    // Establecer proyecto actual
    setCurrentProject: (projectCode: string | null) => {
      if (projectCode) {
        localStorage.setItem('ciceron_current_project', projectCode);
      } else {
        localStorage.removeItem('ciceron_current_project');
      }
      set({ currentProjectCode: projectCode });
    },

    // Obtener proyecto por ID
    getProjectById: (projectId: string) => {
      return get().projects.find((p) => p.id === projectId);
    },

    // Limpiar error
    clearError: () => {
      set({ error: null });
    },

    // Exponer función de mapeo
    mapProjectToDebateHistory,
  }))
);

// Hook para obtener el proyecto actual
export const useCurrentProject = () => {
  const store = useProjectStore();
  return store.currentProjectCode;
};

export default useProjectStore;
