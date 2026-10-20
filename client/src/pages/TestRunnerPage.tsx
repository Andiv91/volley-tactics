import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TestDetail, Question } from '../types';
import { MediaViewer } from '../components/media/MediaViewer';
import { VolleyballLoader, VolleyballLogo } from '../components/ui/VolleyballLoader';
import { formatQuestionComplexity, sortQuestionOptions } from '../utils/tacticsFormatters';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Award,
  Maximize2,
  X,
  ImageIcon,
  Info,
  Users,
} from 'lucide-react';

interface TestRunnerPageProps {
  testId: string;
  onFinish: (submissionResult: any) => void;
  onCancel: () => void;
  onNavigateToTeam?: () => void;
}

export const TestRunnerPage: React.FC<TestRunnerPageProps> = ({
  testId,
  onFinish,
  onCancel,
  onNavigateToTeam,
}) => {
  const { user } = useAuth();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNoTeamError, setHasNoTeamError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        // Verificar que el estudiante tenga un equipo seleccionado
        if (user && user.role === 'USER') {
          const hasLocalTeam = Boolean(user.teamId || user.team);
          if (!hasLocalTeam) {
            const teamRes = await api.getMyTeam().catch(() => ({ team: null }));
            if (!teamRes.team) {
              setHasNoTeamError(true);
              setLoading(false);
              return;
            }
          }
        }

        const res = await api.getTestById(testId);
        setTest(res.test);
      } catch (err) {
        console.error('Error cargando test:', err);
        alert('No se pudo cargar la evaluación.');
        onCancel();
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId, user]);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (hasNoTeamError) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-3xl bg-[#26050b]/90 border-2 border-amber-500/50 backdrop-blur-md shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
            Paso Obligatorio
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-3">
            Debes seleccionar un equipo primero
          </h2>
          <p className="text-amber-100 text-sm leading-relaxed mt-2">
            Debes seleccionar un equipo primero en la pestaña <strong className="text-amber-300">Equipos</strong>, busca el que tu técnico haya creado. De esta forma tus respuestas y estadísticas quedarán vinculadas a su auditoría.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              if (onNavigateToTeam) onNavigateToTeam();
              else onCancel();
            }}
            className="flex-1 inline-flex items-center justify-center space-x-2 py-3 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg"
          >
            <Users className="w-4 h-4" />
            <span>Ir a Equipos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-300 font-bold text-xs uppercase tracking-wider transition-all border border-white/10"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (loading || !test) {
    return <VolleyballLoader text="Preparando situaciones de juego y video..." />;
  }

  const questions = test.questions || [];
  const currentQuestion: Question | undefined = questions[currentIndex];
  const totalQuestions = questions.length;
  const progressPercentage = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if some questions are unanswered
    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount < totalQuestions) {
      const confirmSubmit = window.confirm(
        `Has respondido ${answeredCount} de ${totalQuestions} preguntas. ¿Deseas entregar la evaluación de todas formas?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));

      const res = await api.submitTest({
        testId: test.id,
        answers: formattedAnswers,
        timeSpentSeconds: secondsElapsed,
      });

      onFinish(res.submission);
    } catch (err: any) {
      console.error('Error al enviar respuestas:', err);
      alert(err.message || 'Error al enviar la evaluación');
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Top Test Header & Progress Bar */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[10px] font-black tracking-widest text-rose-300 uppercase">
              Evaluación Táctica en Curso
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">{test.title}</h2>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs font-mono font-bold text-rose-200">
              <Clock className="w-4 h-4 text-rose-400" />
              <span>{formatTimer(secondsElapsed)}</span>
            </div>

            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-rose-200 hover:text-white transition-all"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Dynamic Volleyball Trajectory Progress Bar */}
        <div className="relative pt-3">
          <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-semibold text-rose-200 mt-2">
            <span>
              Pregunta {currentIndex + 1} de {totalQuestions}
            </span>
            <span>{progressPercentage}% completado</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {currentQuestion.category && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: currentQuestion.category.color || '#ef4444' }}
              >
                {currentQuestion.category.name}
              </span>
            )}

            {(() => {
              const comp = formatQuestionComplexity(currentQuestion.difficulty);
              return (
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${comp.badgeClass}`}>
                  {comp.label}
                </span>
              );
            })()}

            <span className="px-3 py-1 rounded-full bg-black/30 border border-white/15 text-xs font-semibold text-rose-200 uppercase tracking-wider">
              Fase: {currentQuestion.phase}
            </span>
          </div>

          {/* Title & Context Scenario */}
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {currentQuestion.title}
            </h3>

            {currentQuestion.context && (
              <p className="mt-3 text-sm sm:text-base text-rose-100/90 leading-relaxed bg-black/25 p-4 rounded-2xl border border-white/10 italic">
                “{currentQuestion.context}”
              </p>
            )}
          </div>

          {/* Multimedia Element (YouTube embed / MP4 / Image) */}
          <MediaViewer
            imageUrl={currentQuestion.imageUrl}
            videoUrl={currentQuestion.videoUrl}
            title={currentQuestion.title}
          />

          {/* Options Selection */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-rose-200 uppercase tracking-wider">
                Selecciona tu decisión táctica:
              </label>
              {currentQuestion.options.some((o) => !!o.imageUrl) && (
                <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Incluye diagramas de cancha
                </span>
              )}
            </div>

            {currentQuestion.options.some((o) => !!o.imageUrl) && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  Observa atentamente el esquema de rotación y cobertura de cada alternativa. Puedes pulsar <strong>"Ampliar"</strong> en cualquier diagrama para inspeccionar los jugadores y zonas en alta resolución.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {sortQuestionOptions(currentQuestion.options).map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 flex items-start space-x-3.5 border ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-400 shadow-xl shadow-rose-900/40 ring-2 ring-white/60 scale-[1.01]'
                        : 'bg-black/30 hover:bg-black/45 text-stone-200 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                        isSelected ? 'bg-white text-rose-700 shadow-sm' : 'bg-white/15 text-white'
                      }`}
                    >
                      {letter}
                    </span>

                    <div className="flex-1 space-y-2.5 pt-0.5">
                      <span className="text-sm font-medium leading-snug block">
                        {option.text}
                      </span>
                      {option.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-white/20 bg-stone-950/80 max-w-sm sm:max-w-md shadow-md">
                          <img
                            src={option.imageUrl}
                            alt={`Diagrama táctico opción ${letter}`}
                            className="w-full h-auto max-h-60 object-contain p-2 hover:scale-[1.01] transition-transform duration-200 bg-stone-900/40"
                            loading="eager"
                            onError={(e) => {
                              console.warn(`Error al cargar diagrama táctico: ${option.imageUrl}`);
                            }}
                          />
                          <div className="px-3 py-1.5 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-300">
                            <span className="font-semibold text-rose-300 flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              Diagrama Táctico {letter}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomedImage({
                                  url: option.imageUrl!,
                                  title: `Diagrama Táctico - Opción ${letter}: ${option.text}`,
                                });
                              }}
                              className="px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/30 text-white font-bold flex items-center gap-1 transition-colors"
                            >
                              <Maximize2 className="w-3 h-3" />
                              <span>Ampliar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all ${
                currentIndex === 0
                  ? 'opacity-30 cursor-not-allowed text-stone-400'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-rose-600/40 transition-all active:scale-95"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-7 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider shadow-xl hover:shadow-emerald-600/40 transition-all active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Enviando...' : 'Finalizar y Entregar'}</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* Lightbox / Zoom Modal for Tactical Diagrams */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-stone-900 border border-white/20 rounded-3xl p-5 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-rose-400" />
                <span>{zoomedImage.title}</span>
              </h4>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-black text-sm transition-colors"
                title="Cerrar vista previa"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-auto rounded-2xl bg-black/70 p-3 border border-white/10">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            <div className="mt-3 text-center">
              <p className="text-[11px] text-stone-400">
                Haz clic fuera de este cuadro o presiona la <strong>X</strong> para volver a responder la evaluación.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
