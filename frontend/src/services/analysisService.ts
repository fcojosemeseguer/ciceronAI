/**
 * Servicio de análisis - Procesamiento de audio y evaluación con IA
 * Comunicación con el backend para subir audios y obtener análisis
 */

import apiService from './api';

export type DebatePhase = 'Introducción' | 'Refutación 1' | 'Refutación 2' | 'Conclusión' | 'Final';
export type DebatePosture = 'A Favor' | 'En Contra';

export interface AnalysisData {
  project_code: string;
  fase: DebatePhase;
  postura: DebatePosture;
  orador: string;
  num_speakers: number;
  file: File;
}

export interface Criterion {
  criterio: string;
  nota: number;
  anotacion: string;
}

export interface AnalysisResponse {
  message: string;
  fase: string;
  postura: string;
  orador: string;
  criterios: Criterion[];
  total: number;
  max_total: number;
}

class AnalysisService {
  async analyzeAudio(data: AnalysisData): Promise<AnalysisResponse> {
    const token = apiService.getToken();
    
    if (!token) {
      throw new Error('No hay sesión activa. Por favor, inicia sesión.');
    }

    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('jwt', token);
    formData.append('project_code', data.project_code);
    formData.append('fase', data.fase);
    formData.append('postura', data.postura);
    formData.append('orador', data.orador);
    formData.append('num_speakers', data.num_speakers.toString());
    formData.append('file', data.file);

    const response = await apiService.postFormData<AnalysisResponse>('/analyse', formData);

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al analizar el audio');
    }

    return response.data;
  }

  // Mapeo de tipos de ronda del frontend a fases del backend
  mapRoundTypeToPhase(roundType: string): DebatePhase {
    const mapping: Record<string, DebatePhase> = {
      'Introducción': 'Introducción',
      'Primer Refutador': 'Refutación 1',
      'Segundo Refutador': 'Refutación 2',
      'Conclusión': 'Conclusión',
    };
    return mapping[roundType] || 'Introducción';
  }

  // Mapeo de posición del equipo a postura
  mapTeamToPosture(team: 'A' | 'B'): DebatePosture {
    // Equipo A siempre es "A Favor" y Equipo B "En Contra" en el contexto del debate
    return team === 'A' ? 'A Favor' : 'En Contra';
  }
}

export const analysisService = new AnalysisService();
export default analysisService;
