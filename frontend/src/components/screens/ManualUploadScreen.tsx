import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Upload, FileAudio, X, Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { LiquidGlassButton } from '../common';
import { analysisService, DebatePhase } from '../../services';
import { projectService } from '../../services';

interface AudioSection {
  id: string;
  team: 'A' | 'B';
  phase: string;
  phaseLabel: string;
  file: File | null;
  isUploading: boolean;
  isAnalyzed: boolean;
  result: any | null;
}

interface ManualUploadScreenProps {
  onBack: () => void;
  onComplete: (projectCode: string) => void;
}

const PHASES = [
  { id: 'intro', label: 'Introducción' },
  { id: 'ref1', label: 'Refutación 1' },
  { id: 'ref2', label: 'Refutación 2' },
  { id: 'conclusion', label: 'Conclusión' },
];

const INITIAL_SECTIONS: AudioSection[] = PHASES.flatMap(phase => [
  {
    id: `${phase.id}-A`,
    team: 'A',
    phase: phase.id,
    phaseLabel: phase.label,
    file: null,
    isUploading: false,
    isAnalyzed: false,
    result: null,
  },
  {
    id: `${phase.id}-B`,
    team: 'B',
    phase: phase.id,
    phaseLabel: phase.label,
    file: null,
    isUploading: false,
    isAnalyzed: false,
    result: null,
  },
]);

export const ManualUploadScreen: React.FC<ManualUploadScreenProps> = ({
  onBack,
  onComplete,
}) => {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'config' | 'upload'>('config');
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [topic, setTopic] = useState('');
  const [configErrors, setConfigErrors] = useState<{ topic?: string }>({});
  const [sections, setSections] = useState<AudioSection[]>(INITIAL_SECTIONS);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [projectCode, setProjectCode] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileSelect = async (sectionId: string, file: File) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, file } : s
    ));
  };

  const handleRemoveFile = (sectionId: string) => {
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, file: null } : s
    ));
    if (fileInputRefs.current[sectionId]) {
      fileInputRefs.current[sectionId]!.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(sectionId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(null);
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverSection(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Validar que sea un archivo de audio
      if (file.type.startsWith('audio/')) {
        handleFileSelect(sectionId, file);
      } else {
        alert('Por favor, arrastra solo archivos de audio');
      }
    }
  };

  const convertToWav = async (file: File): Promise<File> => {
    // If already WAV, return as is
    if (file.type === 'audio/wav' || file.name.toLowerCase().endsWith('.wav')) {
      return file;
    }

    // Create audio context for conversion
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert to WAV
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          const wavFile = new File([wavBlob], `${file.name.split('.')[0]}.wav`, { type: 'audio/wav' });
          
          resolve(wavFile);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numberOfChannels * bytesPerSample;
    
    const dataLength = length * numberOfChannels * bytesPerSample;
    const headerLength = 44;
    const wavBuffer = new ArrayBuffer(headerLength + dataLength);
    const view = new DataView(wavBuffer);
    
    // RIFF chunk
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    
    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    
    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write interleaved data
    const offset = 44;
    const channels = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }
    
    let index = 0;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset + index, sample * 0x7FFF, true);
        index += 2;
      }
    }
    
    return wavBuffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const handleStartAnalysis = async () => {
    const filesToAnalyze = sections.filter(s => s.file !== null);
    if (filesToAnalyze.length === 0) {
      alert('Debes subir al menos un audio');
      return;
    }

    setIsAnalyzing(true);
    setProgress({ completed: 0, total: filesToAnalyze.length });

    try {
      // Create project first
      const projectResult = await projectService.createProject({
        name: topic || 'Debate grabado',
        description: `Equipo A: ${teamAName || 'Equipo A'} vs Equipo B: ${teamBName || 'Equipo B'}`,
      });

      const pCode = projectResult.projectCode;
      if (!pCode) {
        throw new Error('Error al crear el proyecto');
      }
      setProjectCode(pCode);

      // Analyze each file
      for (let i = 0; i < filesToAnalyze.length; i++) {
        const section = filesToAnalyze[i];
        
        setSections(prev => prev.map(s => 
          s.id === section.id ? { ...s, isUploading: true } : s
        ));

        // Convert to WAV
        const wavFile = await convertToWav(section.file!);

        // Map phase and team
        const phaseMap: { [key: string]: DebatePhase } = {
          'intro': 'Introducción',
          'ref1': 'Refutación 1',
          'ref2': 'Refutación 2',
          'conclusion': 'Conclusión',
        };

        const fase = phaseMap[section.phase];
        if (!fase) {
          throw new Error(`Fase no válida: ${section.phase}`);
        }

        // Analyze
        const result = await analysisService.analyzeAudio({
          project_code: pCode,
          fase,
          postura: section.team === 'A' ? 'A Favor' : 'En Contra',
          orador: section.team === 'A' ? (teamAName || 'Equipo A') : (teamBName || 'Equipo B'),
          num_speakers: 1,
          file: wavFile,
        });

        setSections(prev => prev.map(s => 
          s.id === section.id ? { 
            ...s, 
            isUploading: false, 
            isAnalyzed: true,
            result 
          } : s
        ));

        setProgress({ completed: i + 1, total: filesToAnalyze.length });
      }

      // Navigate to results
      onComplete(pCode);
    } catch (error) {
      console.error('Error analyzing:', error);
      alert('Error al analizar los audios');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUploadCount = () => sections.filter(s => s.file !== null).length;

  if (step === 'config') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Volver</span>
          </button>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-bold text-white mb-2">Analizar debate grabado</h2>
            <p className="text-white/60 mb-8">
              Configura los equipos y luego sube los audios de cada intervención
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Tema del debate <span className="text-[#FF6B00]">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (configErrors.topic) {
                      setConfigErrors({});
                    }
                  }}
                  placeholder="Ej: Inteligencia Artificial en la educación"
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-white/30 focus:outline-none transition-colors ${
                    configErrors.topic 
                      ? 'border-red-500 focus:border-red-400' 
                      : 'border-white/10 focus:border-[#4A5568]'
                  }`}
                />
                {configErrors.topic && (
                  <p className="mt-2 text-sm text-red-400">{configErrors.topic}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Equipo A (A Favor)
                  </label>
                  <input
                    type="text"
                    value={teamAName}
                    onChange={(e) => setTeamAName(e.target.value)}
                    placeholder="Nombre del equipo"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#4A5568]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Equipo B (En Contra)
                  </label>
                  <input
                    type="text"
                    value={teamBName}
                    onChange={(e) => setTeamBName(e.target.value)}
                    placeholder="Nombre del equipo"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#4A5568]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <LiquidGlassButton
                onClick={() => {
                  if (!topic.trim()) {
                    setConfigErrors({ topic: 'El tema del debate es obligatorio' });
                    return;
                  }
                  setStep('upload');
                }}
                disabled={!topic.trim()}
                variant="primary"
                size="lg"
                className="w-full"
              >
                <span>Continuar</span>
                <ArrowRight className="w-5 h-5" />
              </LiquidGlassButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setStep('config')}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver a configuración</span>
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Subir audios del debate
          </h2>
          <p className="text-white/60">
            {topic || 'Debate grabado'} • {teamAName || 'Equipo A'} vs {teamBName || 'Equipo B'}
          </p>
          <p className="text-white/40 text-sm mt-2 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Arrastra los audios desde tu carpeta directamente a cada sección o haz clic para seleccionar
          </p>
        </div>

        {isAnalyzing && (
          <div className="mb-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <Loader2 className="w-6 h-6 text-[#FF6B00] animate-spin" />
              <span className="text-white font-medium">
                Analizando audios... {progress.completed} de {progress.total}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FF6B00] to-[#00E5FF] transition-all duration-500"
                style={{ width: `${(progress.completed / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {PHASES.map((phase) => (
            <div key={phase.id} className="space-y-4">
              <h3 className="text-lg font-semibold text-white text-center">
                {phase.label}
              </h3>
              
              {['A', 'B'].map((team) => {
                const section = sections.find(s => s.phase === phase.id && s.team === team)!;
                const isActive = currentSection === section.id;
                
                const isDragOver = dragOverSection === section.id;
                
                return (
                  <div
                    key={section.id}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, section.id)}
                    className={`
                      relative backdrop-blur-xl bg-white/5 border rounded-2xl p-4 transition-all
                      ${section.isAnalyzed 
                        ? 'border-green-500/50 bg-green-500/5' 
                        : section.file 
                          ? 'border-[#FF6B00]/50 bg-[#FF6B00]/5'
                          : isDragOver
                            ? 'border-[#00E5FF] bg-[#00E5FF]/10 scale-105'
                            : 'border-white/10 hover:border-white/30'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">
                        Equipo {team}
                      </span>
                      {section.isAnalyzed && (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                    </div>

                    <input
                      ref={(el) => { fileInputRefs.current[section.id] = el; }}
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(section.id, file);
                      }}
                      className="hidden"
                      disabled={section.isUploading || section.isAnalyzed}
                    />

                    {!section.file ? (
                      <button
                        onClick={() => fileInputRefs.current[section.id]?.click()}
                        disabled={isAnalyzing}
                        className={`
                          w-full py-8 border-2 border-dashed rounded-xl flex flex-col items-center gap-2 transition-all
                          ${isDragOver 
                            ? 'border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF]' 
                            : 'border-white/20 text-white/60 hover:text-white hover:border-white/40'
                          }
                        `}
                      >
                        <Upload className={`w-8 h-8 ${isDragOver ? 'animate-bounce' : ''}`} />
                        <span className="text-sm">
                          {isDragOver ? 'Suelta el audio aquí' : 'Seleccionar o arrastrar audio'}
                        </span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                          <FileAudio className="w-5 h-5 text-[#FF6B00]" />
                          <span className="text-white text-sm truncate flex-1">
                            {section.file.name}
                          </span>
                          {!section.isAnalyzed && !section.isUploading && (
                            <button
                              onClick={() => handleRemoveFile(section.id)}
                              className="text-white/40 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                        {section.isUploading && (
                          <div className="flex items-center gap-2 text-[#FF6B00]">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Analizando...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-white/60">
            <span className="text-white font-medium">{getUploadCount()}</span> de 8 audios seleccionados
          </div>
          
          <LiquidGlassButton
            onClick={handleStartAnalysis}
            disabled={getUploadCount() === 0 || isAnalyzing}
            variant="primary"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <span>Analizar debate</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </LiquidGlassButton>
        </div>

        <p className="text-white/40 text-sm mt-4">
          Los audios se convertirán automáticamente a formato WAV y se analizarán uno por uno.
          Puedes subir solo las fases que desees evaluar.
        </p>
      </div>
    </div>
  );
};

export default ManualUploadScreen;
