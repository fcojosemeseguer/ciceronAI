/**
 * Configuración secuencial de rondas del debate
 * Soporta formatos UPCT y RETOR
 */

import { DebateRound, RoundType, DebateConfig, DebateFormatType } from '../types';

// Secuencia de rondas para formato UPCT
export const ROUNDS_SEQUENCE_UPCT: Omit<DebateRound, 'id' | 'duration'>[] = [
  { order: 1, team: 'A', roundType: 'Introducción' },
  { order: 2, team: 'B', roundType: 'Introducción' },
  { order: 3, team: 'A', roundType: 'Primer Refutador' },
  { order: 4, team: 'B', roundType: 'Primer Refutador' },
  { order: 5, team: 'A', roundType: 'Segundo Refutador' },
  { order: 6, team: 'B', roundType: 'Segundo Refutador' },
  { order: 7, team: 'B', roundType: 'Conclusión' },
  { order: 8, team: 'A', roundType: 'Conclusión' },
];

// Secuencia de rondas para formato RETOR
// Fases: Contextualización (6min), Definición (2min), Valoración (5min), Conclusión (3min)
// El equipo a favor (A) abre cada fase
export const ROUNDS_SEQUENCE_RETOR: Omit<DebateRound, 'id' | 'duration'>[] = [
  { order: 1, team: 'A', roundType: 'Contextualización' },
  { order: 2, team: 'B', roundType: 'Contextualización' },
  { order: 3, team: 'A', roundType: 'Definición' },
  { order: 4, team: 'B', roundType: 'Definición' },
  { order: 5, team: 'A', roundType: 'Valoración' },
  { order: 6, team: 'B', roundType: 'Valoración' },
  { order: 7, team: 'B', roundType: 'Conclusión' },
  { order: 8, team: 'A', roundType: 'Conclusión' },
];

/**
 * Obtiene la secuencia de rondas según el formato
 */
export function getRoundsSequence(formatType: DebateFormatType = 'UPCT'): Omit<DebateRound, 'id' | 'duration'>[] {
  return formatType === 'RETOR' ? ROUNDS_SEQUENCE_RETOR : ROUNDS_SEQUENCE_UPCT;
}

/**
 * Genera las rondas completas con duraciones específicas según el formato
 */
export function generateDebateRounds(config: DebateConfig): DebateRound[] {
  const formatType = config.formatType || 'UPCT';
  const sequence = getRoundsSequence(formatType);
  
  return sequence.map((round, idx) => ({
    ...round,
    id: idx,
    duration: getDurationForRoundType(round.roundType, config),
  }));
}

/**
 * Obtiene la duración de una ronda según el tipo y formato
 */
function getDurationForRoundType(roundType: RoundType, config: DebateConfig): number {
  const formatType = config.formatType || 'UPCT';
  const durations = config.roundDurations;
  
  if (formatType === 'RETOR') {
    switch (roundType) {
      case 'Contextualización':
        return durations.contextualizacion || 360; // 6 minutos
      case 'Definición':
        return durations.definicion || 120; // 2 minutos
      case 'Valoración':
        return durations.valoracion || 300; // 5 minutos
      case 'Conclusión':
        return durations.conclusion || 180; // 3 minutos
      default:
        return 180;
    }
  } else {
    // UPCT format
    switch (roundType) {
      case 'Introducción':
        return durations.introduccion || 180;
      case 'Primer Refutador':
        return durations.primerRefutador || 240;
      case 'Segundo Refutador':
        return durations.segundoRefutador || 240;
      case 'Conclusión':
        return durations.conclusion || 180;
      default:
        return 180;
    }
  }
}

/**
 * Obtiene información de la ronda actual
 */
export function getCurrentRoundInfo(roundIndex: number, config: DebateConfig) {
  const rounds = generateDebateRounds(config);
  return rounds[roundIndex] || null;
}

/**
 * Verifica si es el último turno del debate según el formato
 */
export function isLastRound(roundIndex: number, formatType: DebateFormatType = 'UPCT'): boolean {
  const sequence = getRoundsSequence(formatType);
  return roundIndex >= sequence.length - 1;
}

/**
 * Obtiene el nombre de una fase en el formato actual
 */
export function getPhaseName(roundType: RoundType, formatType: DebateFormatType = 'UPCT'): string {
  if (formatType === 'RETOR') {
    // En RETOR, las fases tienen nombres específicos
    const phaseNames: Record<string, string> = {
      'Contextualización': 'Contextualización',
      'Definición': 'Definición',
      'Valoración': 'Valoración',
      'Conclusión': 'Conclusión',
    };
    return phaseNames[roundType] || roundType;
  }
  return roundType;
}

/**
 * Obtiene las duraciones por defecto según el formato
 */
export function getDefaultDurations(formatType: DebateFormatType = 'UPCT'): DebateConfig['roundDurations'] {
  if (formatType === 'RETOR') {
    return {
      contextualizacion: 360, // 6 minutos
      definicion: 120,        // 2 minutos
      valoracion: 300,        // 5 minutos
      conclusion: 180,        // 3 minutos
    };
  }
  
  return {
    introduccion: 180,      // 3 minutos
    primerRefutador: 240,   // 4 minutos
    segundoRefutador: 240,  // 4 minutos
    conclusion: 180,        // 3 minutos
  };
}
