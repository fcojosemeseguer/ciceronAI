/**
 * SetupScreen - Pantalla de configuración inicial del debate
 * Estilo Aurora con colores naranja/cian
 * INTEGRACIÓN: Crea proyecto en backend antes de iniciar
 */

import React, { useState, useEffect } from 'react';
import { Play, Loader2, BookOpen, Clock, Users } from 'lucide-react';
import { useDebateStore } from '../../store/debateStore';
import { useProjectStore } from '../../store/projectStore';
import { DebateConfig, DebateFormatType } from '../../types';
import { getDefaultDurations } from '../../utils/roundsSequence';
import { LiquidGlassButton } from '../common';

interface SetupScreenProps {
  onStartDebate: () => void;
  onBack: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStartDebate, onBack }) => {
  const { initializeDebate } = useDebateStore();
  const { 
    createProject, 
    isLoading, 
    error: projectError, 
    clearError,
    loadFormats,
    availableFormats,
    formatsLoading 
  } = useProjectStore();
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState<DebateConfig>({
    teamAName: 'Equipo A',
    teamBName: 'Equipo B',
    debateTopic: '',
    formatType: 'UPCT',
    roundDurations: getDefaultDurations('UPCT'),
  });

  // Cargar formatos disponibles al montar el componente
  useEffect(() => {
    loadFormats();
  }, [loadFormats]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: keyof DebateConfig
  ) => {
    if (key === 'roundDurations') return;
    setFormData({ ...formData, [key]: e.target.value });
    if (error) setError('');
    if (projectError) clearError();
  };

  const handleFormatChange = (formatType: DebateFormatType) => {
    setFormData({
      ...formData,
      formatType,
      roundDurations: getDefaultDurations(formatType),
    });
    if (error) setError('');
    if (projectError) clearError();
  };

  const handleStart = async () => {
    
    if (!formData.debateTopic.trim()) {
      setError('Debes ingresar un tema para el debate');
      return;
    }
    
    if (!formData.teamAName.trim()) {
      setError('Debes ingresar el nombre del Equipo A');
      return;
    }
    
    if (!formData.teamBName.trim()) {
      setError('Debes ingresar el nombre del Equipo B');
      return;
    }
    
    setIsCreating(true);
    setError('');
    
    try {
      // Crear proyecto en el backend
      await createProject(
        formData.debateTopic,
        `Debate: ${formData.teamAName} vs ${formData.teamBName}`,
        {
          teamAName: formData.teamAName,
          teamBName: formData.teamBName,
          debateTopic: formData.debateTopic,
          formatType: formData.formatType,
        }
      );
      
      // Inicializar el debate localmente
      initializeDebate(formData);
      
      setTimeout(() => {
        onStartDebate();
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Error al crear el proyecto. Inténtalo de nuevo.');
    } finally {
      setIsCreating(false);
    }
  };

  // Obtener información del formato seleccionado
  const selectedFormat = availableFormats.find(f => f.codigo === formData.formatType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="h-screen overflow-y-auto pb-32">
        <main className="px-4 sm:px-6 lg:px-8 pt-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
                Configuración del Debate
              </h1>
              <p className="text-white/60">Personaliza los equipos y tiempos</p>
            </div>

            {(error || projectError) && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-center">
                {error || projectError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center">
                    <span className="text-[#FF6B00] font-bold">A</span>
                  </div>
                  <div>
                    <p className="text-[#FF6B00] text-sm font-medium">EQUIPO A</p>
                    <p className="text-white/50 text-xs">A favor</p>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.teamAName}
                  onChange={(e) => handleInputChange(e, 'teamAName')}
                  disabled={isCreating || isLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#4A5568] transition-colors disabled:opacity-50"
                  placeholder="Nombre del equipo"
                />
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/20 flex items-center justify-center">
                    <span className="text-[#00E5FF] font-bold">B</span>
                  </div>
                  <div>
                    <p className="text-[#00E5FF] text-sm font-medium">EQUIPO B</p>
                    <p className="text-white/50 text-xs">En contra</p>
                  </div>
                </div>

                <input
                  type="text"
                  value={formData.teamBName}
                  onChange={(e) => handleInputChange(e, 'teamBName')}
                  disabled={isCreating || isLoading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#4A5568] transition-colors disabled:opacity-50"
                  placeholder="Nombre del equipo"
                />
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Tema del Debate <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.debateTopic}
                onChange={(e) => handleInputChange(e, 'debateTopic')}
                disabled={isCreating || isLoading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#4A5568] transition-colors disabled:opacity-50"
                placeholder="Ingresa el tema del debate..."
              />
            </div>

            {/* Selector de formato - Cards cuadradas */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-purple-400 text-sm font-medium">FORMATO DE DEBATE</p>
                  <p className="text-white/50 text-xs">Selecciona el tipo de debate</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card UPCT */}
                <button
                  type="button"
                  onClick={() => handleFormatChange('UPCT')}
                  disabled={isCreating || isLoading || formatsLoading}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                    formData.formatType === 'UPCT'
                      ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-2xl font-bold ${
                        formData.formatType === 'UPCT' ? 'text-blue-400' : 'text-white'
                      }`}>
                        UPCT
                      </span>
                      {formData.formatType === 'UPCT' && (
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-white/70 text-sm mb-4 flex-grow">
                      Formato clásico con 5 fases de debate académico
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <Users className="w-4 h-4" />
                        <span>5 fases</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <Clock className="w-4 h-4" />
                        <span>~26 minutos</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Card RETOR */}
                <button
                  type="button"
                  onClick={() => handleFormatChange('RETOR')}
                  disabled={isCreating || isLoading || formatsLoading}
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                    formData.formatType === 'RETOR'
                      ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500 shadow-lg shadow-emerald-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-2xl font-bold ${
                        formData.formatType === 'RETOR' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        RETOR
                      </span>
                      {formData.formatType === 'RETOR' && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-white/70 text-sm mb-4 flex-grow">
                      Formato académico con 4 fases y 5 criterios de evaluación
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <Users className="w-4 h-4" />
                        <span>4 fases</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <Clock className="w-4 h-4" />
                        <span>~32 minutos</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Descripción del formato seleccionado */}
              {selectedFormat && (
                <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-white/80 text-sm">{selectedFormat.descripcion}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.formatType === 'UPCT' ? (
                      <React.Fragment>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">Introducción: 3min</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">Refutación 1: 4min</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">Refutación 2: 4min</span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">Conclusión: 3min</span>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded">Contextualización: 6min</span>
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded">Definición: 2min</span>
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded">Valoración: 5min</span>
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded">Conclusión: 3min</span>
                      </React.Fragment>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 mb-8">
              <LiquidGlassButton
                onClick={onBack}
                variant="secondary"
                className="flex-1"
                disabled={isCreating || isLoading}
              >
                Cancelar
              </LiquidGlassButton>
              
              <LiquidGlassButton
                onClick={handleStart}
                variant="primary"
                className="flex-[2]"
                disabled={isCreating || isLoading}
              >
                {isCreating || isLoading ? (
                  <React.Fragment>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creando...</span>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Play className="w-5 h-5" />
                    <span>Iniciar Debate</span>
                  </React.Fragment>
                )}
              </LiquidGlassButton>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
