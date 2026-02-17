/**
 * Hook compuesto para manejar grabación automática durante rondas
 * INTEGRACIÓN: Envía audio al backend para análisis con IA
 */

import { useEffect, useRef, useState } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { useDebateStore } from '../store/debateStore';
import { useProjectStore } from '../store/projectStore';
import { analysisService } from '../services/analysisService';

interface UseAutoAudioRecordingReturn {
  isRecording: boolean;
  audioError: string | null;
  isAnalyzing: boolean;
  analysisError: string | null;
}

export const useAutoAudioRecording = (): UseAutoAudioRecordingReturn => {
  const { isRecording, startRecording, stopRecording, error } = useAudioRecorder();
  const {
    state: debateState,
    isTimerRunning,
    timeRemaining,
    getCurrentRound,
    addRecording,
    config,
  } = useDebateStore();
  const { currentProjectCode } = useProjectStore();

  const recordingStartedRef = useRef(false);
  const currentRoundRef = useRef(getCurrentRound());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    currentRoundRef.current = getCurrentRound();
  }, [getCurrentRound]);

  // Iniciar grabación cuando comienza un turno
  useEffect(() => {
    if (debateState === 'running' && isTimerRunning && !isRecording && !recordingStartedRef.current) {
      startRecording();
      recordingStartedRef.current = true;
      setAnalysisError(null);
    }
  }, [debateState, isTimerRunning, isRecording, startRecording]);

  // Detener grabación cuando:
  // 1. El tiempo llega a 0
  // 2. Se pausa el debate
  // 3. Se cambia de turno
  useEffect(() => {
    if (
      isRecording &&
      recordingStartedRef.current &&
      (timeRemaining === 0 || debateState === 'paused' || !isTimerRunning)
    ) {
      stopRecording().then(async (recording) => {
        if (recording && currentRoundRef.current) {
          // Actualizar información de la grabación
          recording.team = currentRoundRef.current.team;
          recording.roundType = currentRoundRef.current.roundType;
          recording.order = currentRoundRef.current.order;

          // Guardar en el store
          addRecording(recording);

          // Enviar al backend para análisis si tenemos un proyecto activo
          if (currentProjectCode && recording.blob) {
            setIsAnalyzing(true);
            setAnalysisError(null);
            
            try {
              // Convertir Blob a File
              const audioFile = new File([recording.blob], `round-${recording.order}.wav`, {
                type: 'audio/wav',
              });

              // Obtener el nombre del orador según el equipo
              const orador = recording.team === 'A' 
                ? config.teamAName 
                : config.teamBName;

              // Enviar al backend
              const result = await analysisService.analyzeAudio({
                project_code: currentProjectCode,
                fase: analysisService.mapRoundTypeToPhase(recording.roundType),
                postura: analysisService.mapTeamToPosture(recording.team),
                orador: orador,
                num_speakers: 1, // Por defecto 1 orador
                file: audioFile,
              });

              console.log('Análisis completado:', result);
              
              // Aquí podrías guardar el resultado del análisis en el store
              // para mostrarlo posteriormente
            } catch (err: any) {
              console.error('Error en el análisis:', err);
              setAnalysisError(err.message || 'Error al analizar el audio');
            } finally {
              setIsAnalyzing(false);
            }
          }
        }
        recordingStartedRef.current = false;
      });
    }
  }, [
    timeRemaining, 
    debateState, 
    isTimerRunning, 
    isRecording, 
    stopRecording, 
    addRecording,
    currentProjectCode,
    config.teamAName,
    config.teamBName,
  ]);

  return {
    isRecording,
    audioError: error,
    isAnalyzing,
    analysisError,
  };
};
