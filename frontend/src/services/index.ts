/**
 * Servicios de la aplicación
 * Exportación centralizada de todos los servicios
 */

export { apiService } from './api';
export { apiServiceV2 } from './apiV2';
export { authService, type LoginCredentials, type RegisterCredentials, type AuthResponse, type User } from './authService';
export { projectService, type CreateProjectData, type Project, type CreateProjectResponse, type DebateFormat } from './projectService';
export { analysisService, type AnalysisData, type AnalysisResponse, type DebatePhase, type DebatePosture, type Criterion } from './analysisService';
