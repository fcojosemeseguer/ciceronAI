/**
 * Tipos principales para la aplicación de debate competitivo
 */

export type TeamPosition = 'A' | 'B';
export type RoundType = 
  | 'Introducción' 
  | 'Primer Refutador' 
  | 'Segundo Refutador' 
  | 'Conclusión'
  | 'Contextualización'  // RETOR
  | 'Definición'         // RETOR
  | 'Valoración';        // RETOR
export type DebateState = 'setup' | 'paused' | 'running' | 'finished';
export type DebateTypeId = 'upct' | 'retor';

/**
 * Definición de una ronda de debate
 */
export interface DebateRound {
  id: number;
  order: number;
  team: TeamPosition;
  roundType: RoundType;
  duration: number;
  audioRecording?: AudioRecording;
}

/**
 * Grabación de audio para cada intervención (formato WAV)
 */
export interface AudioRecording {
  id: string;
  team: TeamPosition;
  roundType: RoundType;
  order: number;
  timestamp: string;
  duration: number;
  blob?: Blob;  // Formato WAV para compatibilidad con APIs
  url?: string; // URL temporal para reproducción
}

/**
 * Configuración inicial del debate
 */
export interface DebateConfig {
  teamAName: string;
  teamBName: string;
  debateTopic: string;
  debateType: 'upct' | 'retor';
  roundDurations: {
    introduccion: number;
    primerRefutador: number;
    segundoRefutador: number;
    conclusion: number;
  };
}

/**
 * Estado completo del debate durante la competición
 */
export interface DebateSessionState {
  config: DebateConfig;
  state: DebateState;
  currentRoundIndex: number;
  currentTeam: TeamPosition;
  timeRemaining: number;
  isTimerRunning: boolean;
  recordings: AudioRecording[];
}

/**
 * Información de un equipo
 */
export interface TeamInfo {
  id: TeamPosition;
  name: string;
  isActive: boolean;
  timeRemaining: number;
  currentRoundType?: RoundType;
  roundOrder?: number;
}

/**
 * Puntuación de un equipo en un debate
 */
export interface TeamScore {
  teamId: TeamPosition;
  teamName: string;
  argumentation: number;
  refutation: number;
  presentation: number;
  total: number;
}

/**
 * Historial de debate completado
 */
export interface DebateHistory {
  id: string;
  date: string;
  topic: string;
  teamAName: string;
  teamBName: string;
  winner: TeamPosition | 'draw';
  scores: TeamScore[];
  duration: number;
  summary: string;
  recordingsCount: number;
}

/**
 * Usuario básico
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

/**
 * Usuario con perfil extendido
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  totalDebates: number;
  wins: number;
}

/**
 * Criterio de evaluación de la rúbrica
 */
export interface RubricCriterion {
  id: string;
  category: string;
  description: string;
  maxScore: number;
}

/**
 * Puntuación de un equipo en un criterio específico
 */
export interface CriterionScore {
  criterionId: string;
  score: number;
  feedback?: string;
}

/**
 * Tipos de ronda para la rúbrica
 */
export type RubricRoundType = 'introducciones' | 'refutacion1' | 'refutacion2' | 'conclusiones';

/**
 * Criterio de evaluación específico de una ronda
 */
export interface RoundCriterion {
  id: string;
  description: string;
  maxScore: number;
}

/**
 * Sección de rúbrica para una ronda específica
 */
export interface RubricSection {
  roundType: RubricRoundType;
  roundName: string;
  criteria: RoundCriterion[];
}

/**
 * Puntuación de un orador en un criterio específico
 */
export interface SpeakerCriterionScore {
  criterionId: string;
  score: number;
  notes?: string;
}

/**
 * Puntuación de un orador en una ronda
 */
export interface SpeakerRoundScore {
  speakerId: string;
  speakerName: string;
  roundType: RubricRoundType;
  criterionScores: SpeakerCriterionScore[];
  totalScore: number;
  notes?: string;
}

/**
 * Puntuación detallada de un equipo con evaluación por rondas
 */
export interface DetailedTeamScore {
  teamId: TeamPosition;
  teamName: string;
  roundScores: SpeakerRoundScore[];
  teamConnectionScore: number;
  totalScore: number;
  bestSpeaker?: string;
  overallNotes?: string;
}

/**
 * Resultado completo de evaluación de un debate
 */
export interface DebateScoringResult {
  debateId: string;
  date: string;
  topic: string;
  teamAName: string;
  teamBName: string;
  winner: TeamPosition | 'draw';
  teamAScore: DetailedTeamScore;
  teamBScore: DetailedTeamScore;
  duration: number;
  aiGenerated: boolean;
  summary: string;
}

// =============================================================================
// NUEVOS TIPOS PARA BACKEND INTEGRATION
// =============================================================================

/**
 * Tipo de debate desde backend
 */
export interface DebateType {
  id: string;
  nombre: string;
  descripcion: string;
  fases: FaseConfig[];
  posturas: string[];
  escala_min: number;
  escala_max: number;
  evaluation_mode: 'per_speaker' | 'per_team';
}

/**
 * Configuración de fase desde backend
 */
export interface FaseConfig {
  id: string;
  nombre: string;
  descripcion: string;
  tiempo_segundos: number;
  permite_preguntas: boolean;
  permite_minuto_oro?: boolean;
  orador_unico?: boolean;
}

/**
 * Proyecto de debate
 */
export interface Project {
  code: string;
  name: string;
  description: string;
  debate_type: string;
  user_code: string;
  created_at?: string;
}

/**
 * Resultado de análisis desde backend
 */
export interface AnalysisResult {
  message: string;
  fase: string;
  postura: string;
  orador: string;
  criterios: CriterioResult[];
  total: number;
  max_total: number;
  debate_type: string;
}

/**
 * Criterio con puntuación
 */
export interface CriterioResult {
  criterio: string;
  nota: number;
  anotacion: string;
}

/**
 * Upload de audio para análisis
 */
export interface AudioUpload {
  id: string;
  faseId: string;
  faseNombre: string;
  postura: string;
  numOradores: number;
  file: File | null;
  wavBlob?: Blob;
  status: 'pending' | 'converting' | 'uploading' | 'analyzing' | 'completed' | 'error';
  progress?: number;
  result?: AnalysisResult;
  error?: string;
  // Campos adicionales para configuración de fase
  minutoOroUtilizado?: boolean;      // ¿Se usó minuto de oro?
  preguntasRealizadas?: number;      // Número de preguntas realizadas
  preguntasRespondidas?: number;     // Número de preguntas respondidas
  primerMinutoProtegido?: boolean;   // RETOR: primer minuto sin preguntas
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  user: string;
  pswd: string;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: string;
}

/**
 * Datos para crear proyecto
 */
export interface CreateProjectData {
  name: string;
  description: string;
  debate_type: string;
}

// =============================================================================
// RÚBRICA RETOR
// =============================================================================

/**
 * Ítem de evaluación para rúbrica RETOR
 */
export interface RetorCriterion {
  id: string;
  category: string;
  description: string;
  maxScore: number;
}

/**
 * Sección de la rúbrica RETOR
 */
export interface RetorRubricSection {
  id: string;
  name: string;
  criteria: RetorCriterion[];
}

/**
 * Rúbrica completa RETOR - 10 ítems, escala 1-5, máximo 50 puntos
 */
export const RETOR_RUBRIC: RetorRubricSection[] = [
  {
    id: 'comprension-mocion',
    name: '1. La Comprensión de la Moción y del Desarrollo del Debate',
    criteria: [
      {
        id: 'ajuste-mocion',
        category: 'A favor / En contra',
        description: 'Ajuste a la moción: Los argumentos son claros, comprensibles y defendidos con razonamientos sólidos',
        maxScore: 5
      },
      {
        id: 'coherencia-contextual',
        category: 'A favor / En contra',
        description: 'Coherencia contextual: El contexto expuesto explica adecuadamente la situación del debate y justifica por qué su postura es necesaria o adecuada',
        maxScore: 5
      },
      {
        id: 'anticipacion-refutacion',
        category: 'A favor / En contra',
        description: 'Anticipación a la refutación: El equipo demuestra conocer los puntos fuertes del rival y los puntos débiles propios, anticipando críticas o respondiendo a posibles ataques',
        maxScore: 5
      },
      {
        id: 'desarrollo-logico',
        category: 'A favor / En contra',
        description: 'Desarrollo lógico: Los argumentos se presentan de forma ordenada, conectados entre fases (definición → contexto → valoración)',
        maxScore: 5
      },
      {
        id: 'cierre-sintetico',
        category: 'A favor / En contra',
        description: 'Cierre sintético: En la conclusión, el equipo sintetiza los principales acuerdos y desacuerdos del debate sin introducir información nueva',
        maxScore: 5
      }
    ]
  },
  {
    id: 'relevancia-informacion',
    name: '2. La Relevancia de la Información Presentada',
    criteria: [
      {
        id: 'pertinencia-informacion',
        category: 'A favor / En contra',
        description: 'Pertinencia de la información: Los datos, ejemplos y argumentos utilizados apoyan directamente la línea argumental del equipo',
        maxScore: 5
      },
      {
        id: 'uso-critico',
        category: 'A favor / En contra',
        description: 'Uso crítico: La información no se enumera sin más: se explica, se conecta con la moción y se utiliza para refutar o comparar',
        maxScore: 5
      },
      {
        id: 'fiabilidad-fuentes',
        category: 'A favor / En contra',
        description: 'Fiabilidad de fuentes: El equipo justifica o contextualiza la credibilidad de las fuentes, estudios o ejemplos utilizados',
        maxScore: 5
      }
    ]
  },
  {
    id: 'argumentacion-refutacion',
    name: '3. Argumentación y Refutación (Fase de valoración)',
    criteria: [
      {
        id: 'calidad-argumentativa',
        category: 'A favor / En contra',
        description: 'Calidad argumentativa: Los argumentos son claros, comprensibles y defendidos con razonamientos sólidos',
        maxScore: 5
      },
      {
        id: 'refutacion-efectiva',
        category: 'A favor / En contra',
        description: 'Refutación efectiva: El equipo responde directamente a los argumentos del rival y explica por qué su postura es superior',
        maxScore: 5
      }
    ]
  },
  {
    id: 'oratoria-persuasion',
    name: '4. Oratoria y capacidad persuasiva',
    criteria: [
      {
        id: 'claridad-expresiva',
        category: 'A favor / En contra',
        description: 'Claridad expresiva: Mensajes comprensibles, bien estructurados y adaptados al tiempo disponible',
        maxScore: 5
      },
      {
        id: 'persuasion',
        category: 'A favor / En contra',
        description: 'Persuasión: El discurso resulta convincente, seguro y coherente con la estrategia del equipo',
        maxScore: 5
      }
    ]
  },
  {
    id: 'trabajo-equipo',
    name: '5. Trabajo en equipo y uso del formato RETOR',
    criteria: [
      {
        id: 'coordinacion-equipo',
        category: 'A favor / En contra',
        description: 'Coordinación del equipo: Las intervenciones están conectadas entre sí y responden a una estrategia común',
        maxScore: 5
      },
      {
        id: 'uso-tiempo-retor',
        category: 'A favor / En contra',
        description: 'Uso del tiempo RETOR: El equipo gestiona correctamente los tiempos, respeta las fases y utiliza adecuadamente el minuto de oro',
        maxScore: 5
      }
    ]
  }
];

// =============================================================================
// TIPOS LEGACY (mantener para compatibilidad)
// =============================================================================

/**
 * Rúbrica completa de evaluación por rondas (UPCT/Académico)
 */
export const DEBATE_RUBRIC: RubricSection[] = [
  {
    roundType: 'introducciones',
    roundName: 'Introducciones',
    criteria: [
      {
        id: 'intro-closing',
        description: 'Introduce el discurso de forma llamativa y cierra correctamente su intervención.',
        maxScore: 4
      },
      {
        id: 'statu-quo',
        description: 'Presenta el statu quo y definiciones pertinentes.',
        maxScore: 4
      },
      {
        id: 'argument-line',
        description: 'Presenta o desarrolla la línea argumental y/o cita la solución innovadora propuesta.',
        maxScore: 4
      },
      {
        id: 'questions',
        description: 'Pertinencia de las preguntas/respuestas. 0 si no "pasa" pregunta cuando tiene oportunidad. 4 si no le hacen preguntas.',
        maxScore: 4
      },
      {
        id: 'critical-thinking',
        description: 'Habilidad crítica y creativa para mostrar la verosimilitud de las evidencias.',
        maxScore: 4
      },
      {
        id: 'reasoning',
        description: 'Habilidad de razonamiento y argumentación.',
        maxScore: 4
      },
      {
        id: 'comprehension',
        description: 'Comprensión de la premisa y postura del equipo contrario (refuta o adelanta refutación).',
        maxScore: 4
      },
      {
        id: 'communication',
        description: 'Habilidad para comunicar el mensaje con eficacia y liderazgo.',
        maxScore: 4
      },
      {
        id: 'language',
        description: 'Uso y riqueza del lenguaje.',
        maxScore: 4
      },
      {
        id: 'time-management',
        description: 'Ajuste al tiempo establecido. Se penaliza si se queda a más de 20s de terminar o se excede más de 10s.',
        maxScore: 4
      }
    ]
  },
  {
    roundType: 'refutacion1',
    roundName: 'Refutación 1',
    criteria: [
      {
        id: 'ref1-intro-closing',
        description: 'Introduce el discurso de forma llamativa y cierra correctamente su intervención.',
        maxScore: 4
      },
      {
        id: 'ref1-argument-line',
        description: 'Desarrolla la línea argumental y la solución innovadora propuesta.',
        maxScore: 4
      },
      {
        id: 'ref1-refutation',
        description: 'Refuta/adelanta refutación y se defiende de las refutaciones del equipo contrario.',
        maxScore: 4
      },
      {
        id: 'ref1-questions',
        description: 'Pertinencia de las preguntas/respuestas. 0 si no "pasa" pregunta cuando tiene oportunidad. 4 si no le hacen preguntas.',
        maxScore: 4
      },
      {
        id: 'ref1-critical-thinking',
        description: 'Habilidad crítica y creativa para mostrar la verosimilitud de las evidencias.',
        maxScore: 4
      },
      {
        id: 'ref1-reasoning',
        description: 'Habilidad de razonamiento y argumentación.',
        maxScore: 4
      },
      {
        id: 'ref1-comprehension',
        description: 'Comprensión de la premisa y los argumentos de los equipos oponentes y su refutación.',
        maxScore: 4
      },
      {
        id: 'ref1-communication',
        description: 'Habilidad para comunicar el mensaje con eficacia y liderazgo.',
        maxScore: 4
      },
      {
        id: 'ref1-language',
        description: 'Uso y riqueza del lenguaje.',
        maxScore: 4
      },
      {
        id: 'ref1-time-management',
        description: 'Ajuste al tiempo establecido. Se penaliza si se queda a más de 20s de terminar o se excede más de 10s.',
        maxScore: 4
      }
    ]
  },
  {
    roundType: 'refutacion2',
    roundName: 'Refutación 2',
    criteria: [
      {
        id: 'ref2-intro-closing',
        description: 'Introduce el discurso de forma llamativa y cierra correctamente su intervención.',
        maxScore: 4
      },
      {
        id: 'ref2-refutation-defense',
        description: 'Refuta y se defiende de las refutaciones del equipo contrario justificando los puntos de choque de las líneas argumentales.',
        maxScore: 4
      },
      {
        id: 'ref2-reconstruct',
        description: 'Reconstruye la línea argumental o la solución propuesta.',
        maxScore: 4
      },
      {
        id: 'ref2-questions',
        description: 'Pertinencia de las preguntas/respuestas. 0 si no "pasa" pregunta cuando tiene oportunidad. 4 si no le hacen preguntas.',
        maxScore: 4
      },
      {
        id: 'ref2-critical-thinking',
        description: 'Habilidad crítica y creativa para mostrar la verosimilitud de las evidencias.',
        maxScore: 4
      },
      {
        id: 'ref2-reasoning',
        description: 'Habilidad de razonamiento y argumentación.',
        maxScore: 4
      },
      {
        id: 'ref2-comprehension',
        description: 'Comprensión de la premisa y los argumentos de los equipos oponentes y su refutación.',
        maxScore: 4
      },
      {
        id: 'ref2-communication',
        description: 'Habilidad para comunicar el mensaje con eficacia y liderazgo.',
        maxScore: 4
      },
      {
        id: 'ref2-language',
        description: 'Uso y riqueza del lenguaje.',
        maxScore: 4
      },
      {
        id: 'ref2-time-management',
        description: 'Ajuste al tiempo establecido. Se penaliza si se queda a más de 20s de terminar o se excede más de 10s.',
        maxScore: 4
      }
    ]
  },
  {
    roundType: 'conclusiones',
    roundName: 'Conclusiones',
    criteria: [
      {
        id: 'conc-intro-closing',
        description: 'Introduce el discurso de forma llamativa y cierra correctamente su intervención.',
        maxScore: 4
      },
      {
        id: 'conc-summary',
        description: 'Resume sin añadir información.',
        maxScore: 4
      },
      {
        id: 'conc-justification',
        description: 'Justifica los puntos de acogida y choque con su propia línea argumental y solución.',
        maxScore: 4
      },
      {
        id: 'conc-reivindication',
        description: 'Reivindicación de postura propia (énfasis en la tesis del equipo).',
        maxScore: 4
      },
      {
        id: 'conc-exordio',
        description: 'Explicación del exordio/frase usados por el equipo.',
        maxScore: 4
      },
      {
        id: 'conc-reasoning',
        description: 'Habilidad de razonamiento y argumentación.',
        maxScore: 4
      },
      {
        id: 'conc-comprehension',
        description: 'Comprensión de la premisa y los argumentos de los equipos oponentes y su refutación.',
        maxScore: 4
      },
      {
        id: 'conc-communication',
        description: 'Habilidad para comunicar el mensaje con eficacia y liderazgo.',
        maxScore: 4
      },
      {
        id: 'conc-language',
        description: 'Uso y riqueza del lenguaje.',
        maxScore: 4
      },
      {
        id: 'conc-time-management',
        description: 'Ajuste al tiempo establecido. Se penaliza si se queda a más de 20s de terminar o se excede más de 10s.',
        maxScore: 4
      }
    ]
  }
];
