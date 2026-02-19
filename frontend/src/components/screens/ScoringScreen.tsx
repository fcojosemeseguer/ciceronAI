/**
 * ScoringScreen - Pantalla de puntuación y evaluación del debate
 * Soporta rúbricas UPCT (académico) y RETOR
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Trophy, 
  Loader2, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  Mic,
  Brain
} from 'lucide-react';
import { useDebateStore } from '../../store/debateStore';
import { useDebateHistoryStore } from '../../store/debateHistoryStore';
import { 
  DEBATE_RUBRIC,
  RETOR_RUBRIC,
  DetailedTeamScore, 
  DebateScoringResult,
  TeamPosition,
  SpeakerRoundScore,
  RubricRoundType,
  RetorRubricSection
} from '../../types';
import { generateDebatePDF } from '../../utils/pdfGenerator';

interface ScoringScreenProps {
  onFinish: () => void;
  onBack: () => void;
}

interface EditableScores {
  [key: string]: { score: number };
}

// Helpers para colores según el tipo de rúbrica
const getScoreColor = (score: number, isRetor: boolean = false) => {
  if (isRetor) {
    // Escala 1-5 para RETOR
    if (score >= 5) return 'text-green-400';
    if (score >= 4) return 'text-[#00E5FF]';
    if (score >= 3) return 'text-yellow-400';
    if (score >= 2) return 'text-orange-400';
    return 'text-red-400';
  } else {
    // Escala 0-4 para UPCT
    if (score >= 4) return 'text-green-400';
    if (score >= 3) return 'text-[#00E5FF]';
    if (score >= 2) return 'text-yellow-400';
    return 'text-[#FF6B00]';
  }
};

const getScoreBgColor = (score: number, isRetor: boolean = false) => {
  if (isRetor) {
    // Escala 1-5 para RETOR
    if (score >= 5) return 'bg-green-500/20 border-green-500/30';
    if (score >= 4) return 'bg-[#00E5FF]/20 border-[#00E5FF]/30';
    if (score >= 3) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 2) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  } else {
    // Escala 0-4 para UPCT
    if (score >= 4) return 'bg-green-500/20 border-green-500/30';
    if (score >= 3) return 'bg-[#00E5FF]/20 border-[#00E5FF]/30';
    if (score >= 2) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-[#FF6B00]/20 border-[#FF6B00]/30';
  }
};

export const ScoringScreen: React.FC<ScoringScreenProps> = ({ onFinish, onBack }) => {
  const { config, recordings, getAnalysisResults, getTeamScoreFromAnalysis } = useDebateStore();
  const { addDebate } = useDebateHistoryStore();
  const analysisResults = getAnalysisResults();
  
  // Detectar tipo de debate
  const isRetor = config.debateType === 'retor';
  const MAX_SCORE = isRetor ? 50 : 40;
  const MIN_SCORE = isRetor ? 1 : 0;
  
  const [scoringResult, setScoringResult] = useState<DebateScoringResult | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableScores, setEditableScores] = useState<EditableScores>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [teamNotes, setTeamNotes] = useState({
    bestSpeakerA: '',
    bestSpeakerB: '',
    teamConnectionA: isRetor ? 1 : 0,
    teamConnectionB: isRetor ? 1 : 0
  });
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);

  useEffect(() => {
    initializeEmptyScoring();
  }, []);

  useEffect(() => {
    // Si hay resultados de análisis, mostrar análisis por defecto
    // Si no hay, mostrar evaluación manual
    if (analysisResults.length > 0) {
      setShowAnalysisResults(true);
    } else {
      setShowAnalysisResults(false);
    }
  }, [analysisResults.length]);

  const initializeEmptyScoring = () => {
    let initialScores: EditableScores = {};
    
    if (isRetor) {
      // Inicializar con RETOR_RUBRIC (10 criterios)
      RETOR_RUBRIC.forEach(section => {
        section.criteria.forEach(criterion => {
          initialScores[`A-${criterion.id}`] = { score: 1 }; // Mínimo 1 para RETOR
          initialScores[`B-${criterion.id}`] = { score: 1 };
        });
      });
    } else {
      // Inicializar con DEBATE_RUBRIC (UPCT)
      DEBATE_RUBRIC.forEach(section => {
        section.criteria.forEach(criterion => {
          initialScores[`A-${criterion.id}`] = { score: 0 };
          initialScores[`B-${criterion.id}`] = { score: 0 };
        });
      });
    }
    
    setEditableScores(initialScores);

    const initialResult: DebateScoringResult = {
      debateId: `debate-${Date.now()}`,
      date: new Date().toISOString(),
      topic: config.debateTopic,
      teamAName: config.teamAName,
      teamBName: config.teamBName,
      winner: 'draw',
      teamAScore: {
        teamId: 'A',
        teamName: config.teamAName,
        roundScores: [],
        teamConnectionScore: isRetor ? 1 : 0,
        totalScore: 0,
        bestSpeaker: '',
        overallNotes: ''
      },
      teamBScore: {
        teamId: 'B',
        teamName: config.teamBName,
        roundScores: [],
        teamConnectionScore: isRetor ? 1 : 0,
        totalScore: 0,
        bestSpeaker: '',
        overallNotes: ''
      },
      duration: recordings.reduce((sum, r) => sum + (r.duration || 0), 0),
      aiGenerated: false,
      summary: ''
    };

    setScoringResult(initialResult);
  };

  const calculateTeamTotal = (teamId: TeamPosition): number => {
    let total = 0;
    const prefix = `${teamId}-`;
    
    Object.entries(editableScores).forEach(([key, value]) => {
      if (key.startsWith(prefix)) {
        total += value.score;
      }
    });
    
    // Añadir puntuación de conexión de equipo
    const connectionScore = teamId === 'A' ? teamNotes.teamConnectionA : teamNotes.teamConnectionB;
    total += connectionScore;
    
    return total;
  };

  const handleScoreChange = (teamId: TeamPosition, criterionId: string, value: number) => {
    const key = `${teamId}-${criterionId}`;
    const newScore = Math.min(5, Math.max(isRetor ? 1 : 0, value));
    
    setEditableScores(prev => ({ ...prev, [key]: { score: newScore } }));
  };

  const determineWinner = (): TeamPosition | 'draw' => {
    const teamATotal = calculateTeamTotal('A');
    const teamBTotal = calculateTeamTotal('B');
    
    if (teamATotal > teamBTotal) return 'A';
    if (teamBTotal > teamATotal) return 'B';
    return 'draw';
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleSaveEvaluation = async () => {
    if (!scoringResult) {
      console.error('No hay scoringResult');
      return;
    }
    
    try {
      const winner = determineWinner();
      const teamATotal = calculateTeamTotal('A');
      const teamBTotal = calculateTeamTotal('B');
      
      const debateData = {
        id: scoringResult.debateId,
        date: scoringResult.date,
        topic: scoringResult.topic,
        teamAName: scoringResult.teamAName,
        teamBName: scoringResult.teamBName,
        winner: winner,
        scores: [
          {
            teamId: 'A' as const,
            teamName: scoringResult.teamAName,
            argumentation: teamATotal,
            refutation: teamATotal,
            presentation: teamATotal,
            total: teamATotal
          },
          {
            teamId: 'B' as const,
            teamName: scoringResult.teamBName,
            argumentation: teamBTotal,
            refutation: teamBTotal,
            presentation: teamBTotal,
            total: teamBTotal
          }
        ],
        duration: scoringResult.duration,
        summary: `Ganador: ${winner === 'draw' ? 'Empate' : winner === 'A' ? scoringResult.teamAName : scoringResult.teamBName}`,
        recordingsCount: recordings.length
      };
      
      console.log('Guardando debate:', debateData);
      addDebate(debateData);
      console.log('Debate guardado exitosamente');
      
      // Pequeña espera para asegurar que se guarde en localStorage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      onFinish();
    } catch (error) {
      console.error('Error al guardar debate:', error);
      alert('Error al guardar el debate. Por favor, inténtalo de nuevo.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!scoringResult) return;
    setIsGeneratingPDF(true);
    try {
      await generateDebatePDF(scoringResult);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Renderizar rúbrica RETOR
  const renderRetorRubric = () => (
    <div className="space-y-4">
      {RETOR_RUBRIC.map((section) => (
        <div key={section.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold text-left">{section.name}</span>
            </div>
            {expandedSections[section.id] ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections[section.id] && (
            <div className="border-t border-slate-700">
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <span className="text-[#FF6B00] font-semibold">{config.teamAName}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 text-sm">Criterio RETOR</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[#00E5FF] font-semibold">{config.teamBName}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {section.criteria.map((criterion) => {
                    const keyA = `A-${criterion.id}`;
                    const keyB = `B-${criterion.id}`;
                    const scoreA = editableScores[keyA]?.score || 1;
                    const scoreB = editableScores[keyB]?.score || 1;
                    
                    return (
                      <div key={criterion.id} className="grid grid-cols-3 gap-4 items-start bg-slate-900/50 rounded-lg p-3">
                        {/* Puntuación Equipo A */}
                        <div className="flex justify-center">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={scoreA}
                                onChange={(e) => handleScoreChange('A', criterion.id, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-center"
                              />
                              <span className="text-slate-500 text-sm">/ 5</span>
                            </div>
                          ) : (
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getScoreBgColor(scoreA, true)}`}>
                              <span className={`font-bold ${getScoreColor(scoreA, true)}`}>{scoreA}</span>
                              <span className="text-slate-400 text-sm">/ 5</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Descripción del criterio */}
                        <div className="text-center">
                          <p className="text-slate-300 text-sm">{criterion.description}</p>
                          <p className="text-slate-500 text-xs mt-1">{criterion.category}</p>
                        </div>
                        
                        {/* Puntuación Equipo B */}
                        <div className="flex justify-center">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={scoreB}
                                onChange={(e) => handleScoreChange('B', criterion.id, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-center"
                              />
                              <span className="text-slate-500 text-sm">/ 5</span>
                            </div>
                          ) : (
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getScoreBgColor(scoreB, true)}`}>
                              <span className={`font-bold ${getScoreColor(scoreB, true)}`}>{scoreB}</span>
                              <span className="text-slate-400 text-sm">/ 5</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Renderizar rúbrica UPCT (original)
  const renderUpctRubric = () => (
    <div className="space-y-4">
      {DEBATE_RUBRIC.map((section) => (
        <div key={section.roundType} className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleSection(section.roundType)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-slate-400" />
              <span className="text-white font-semibold">{section.roundName}</span>
            </div>
            {expandedSections[section.roundType] ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {expandedSections[section.roundType] && (
            <div className="border-t border-slate-700">
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <span className="text-[#FF6B00] font-semibold">{config.teamAName}</span>
                    <span className="text-slate-500 ml-2">(A Favor)</span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-400 text-sm">Rúbrica</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[#00E5FF] font-semibold">{config.teamBName}</span>
                    <span className="text-slate-500 ml-2">(En Contra)</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {section.criteria.map((criterion) => {
                    const keyA = `A-${criterion.id}`;
                    const keyB = `B-${criterion.id}`;
                    const scoreA = editableScores[keyA]?.score || 0;
                    const scoreB = editableScores[keyB]?.score || 0;
                    
                    return (
                      <div key={criterion.id} className="grid grid-cols-3 gap-4 items-center bg-slate-900/50 rounded-lg p-3">
                        {/* Puntuación Equipo A */}
                        <div className="flex justify-center">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="4"
                                value={scoreA}
                                onChange={(e) => handleScoreChange('A', criterion.id, parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-center"
                              />
                              <span className="text-slate-500 text-sm">/ {criterion.maxScore}</span>
                            </div>
                          ) : (
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getScoreBgColor(scoreA)}`}>
                              <span className={`font-bold ${getScoreColor(scoreA)}`}>{scoreA}</span>
                              <span className="text-slate-400 text-sm">/ {criterion.maxScore}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Descripción */}
                        <div className="text-center">
                          <p className="text-slate-300 text-sm">{criterion.description}</p>
                        </div>
                        
                        {/* Puntuación Equipo B */}
                        <div className="flex justify-center">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="0"
                                max="4"
                                value={scoreB}
                                onChange={(e) => handleScoreChange('B', criterion.id, parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-center"
                              />
                              <span className="text-slate-500 text-sm">/ {criterion.maxScore}</span>
                            </div>
                          ) : (
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getScoreBgColor(scoreB)}`}>
                              <span className={`font-bold ${getScoreColor(scoreB)}`}>{scoreB}</span>
                              <span className="text-slate-400 text-sm">/ {criterion.maxScore}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (!scoringResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center pb-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E5FF]"></div>
      </div>
    );
  }

  const teamATotal = calculateTeamTotal('A');
  const teamBTotal = calculateTeamTotal('B');
  const winner = determineWinner();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-y-auto pb-32">
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button */}
            <div className="w-32">
              <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#1F2A33]/80 to-[#1F2A33]/40 text-white/90 rounded-lg hover:from-[#1F2A33]/90 hover:to-[#1F2A33]/50 transition-all border border-white/20 shadow-[0_8px_32px_rgba(31,42,51,0.4)]">
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
            </div>

            {/* Center: Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10">
                <img src="/logo.svg" alt="CiceronAI" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold text-white">CiceronAI</span>
            </div>

            {/* Right: Edit button */}
            <div className="w-32 flex justify-end">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditing ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-gradient-to-br from-[#1F2A33]/80 to-[#1F2A33]/40 text-white border border-white/20 shadow-[0_8px_32px_rgba(31,42,51,0.4)]'
                }`}
              >
                {isEditing ? <><Save className="w-4 h-4" /><span className="hidden sm:inline">Guardar</span></> : <><Edit3 className="w-4 h-4" /><span className="hidden sm:inline">Editar</span></>}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{scoringResult.topic}</h1>
            <p className="text-slate-400 mb-4">
              Formato: <span className={isRetor ? "text-purple-400 font-semibold" : "text-blue-400 font-semibold"}>
                {isRetor ? 'RETOR' : 'UPCT (Académico)'}
              </span>
              <span className="text-slate-500 mx-2">•</span>
              <span className="text-slate-400">Máximo: {MAX_SCORE} puntos</span>
            </p>
            
            {/* Toggle entre resultados automáticos y manuales - SIEMPRE visible */}
            <div className="flex justify-center gap-2 mb-6">
              <button
                onClick={() => analysisResults.length > 0 && setShowAnalysisResults(true)}
                disabled={analysisResults.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  showAnalysisResults && analysisResults.length > 0
                    ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white border border-purple-500/50'
                    : analysisResults.length === 0
                      ? 'bg-slate-800/30 text-slate-600 border border-slate-700 cursor-not-allowed'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>Análisis Automático ({analysisResults.length})</span>
              </button>
              <button
                onClick={() => setShowAnalysisResults(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  !showAnalysisResults
                    ? 'bg-gradient-to-r from-[#FF6B00]/30 to-[#00E5FF]/30 text-white border border-white/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Evaluación Manual</span>
              </button>
            </div>
            
            {/* Puntuaciones */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className={`p-4 rounded-xl border-2 ${winner === 'A' ? (isRetor ? 'border-purple-500/50 bg-purple-500/10' : 'border-[#FF6B00]/50 bg-[#FF6B00]/10') : 'border-slate-700'}`}>
                <p className={`text-sm font-medium mb-1 ${isRetor ? 'text-purple-400' : 'text-[#FF6B00]'}`}>{config.teamAName}</p>
                <p className="text-3xl font-bold text-white">{isRetor ? getTeamScoreFromAnalysis('A') : teamATotal}</p>
                <p className="text-slate-400 text-xs mt-1">/ {MAX_SCORE} puntos</p>
              </div>
              
              <div className={`p-4 rounded-xl border-2 ${winner === 'B' ? (isRetor ? 'border-purple-500/50 bg-purple-500/10' : 'border-[#00E5FF]/50 bg-[#00E5FF]/10') : 'border-slate-700'}`}>
                <p className={`text-sm font-medium mb-1 ${isRetor ? 'text-purple-400' : 'text-[#00E5FF]'}`}>{config.teamBName}</p>
                <p className="text-3xl font-bold text-white">{isRetor ? getTeamScoreFromAnalysis('B') : teamBTotal}</p>
                <p className="text-slate-400 text-xs mt-1">/ {MAX_SCORE} puntos</p>
              </div>
            </div>
          </div>

          {/* Mostrar rúbrica según el tipo */}
          {!showAnalysisResults && (
            <>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-white mb-2">
                  {isRetor ? 'Rúbrica RETOR (10 criterios)' : 'Rúbrica UPCT (Académico)'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {isRetor 
                    ? 'Escala 1-5 (Excelente) • 50 puntos máximo • Sin ponderaciones'
                    : 'Escala 0-4 • 40 puntos máximo • Por rondas'
                  }
                </p>
              </div>
              
              {isRetor ? renderRetorRubric() : renderUpctRubric()}
            </>
          )}

          {/* Botones de acción */}
          <div className="mt-8 mb-32 bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-[#1F2A33]/80 to-[#1F2A33]/40 text-white rounded-xl font-semibold hover:from-[#1F2A33]/90 hover:to-[#1F2A33]/50 transition-all border border-white/20 shadow-[0_8px_32px_rgba(31,42,51,0.4)] disabled:opacity-50"
              >
                {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                <span>Descargar PDF</span>
              </button>
              
              <button
                onClick={handleSaveEvaluation}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-green-600/20 to-green-600/10 text-green-400 rounded-xl font-semibold hover:from-green-600/30 hover:to-green-600/20 transition-all border border-green-500/30 shadow-[[0_8px_32px_rgba(34,197,94,0.2)]"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Guardar Evaluación</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringScreen;
