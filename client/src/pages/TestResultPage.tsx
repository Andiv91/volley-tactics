import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Submission } from '../types';
import { VolleyballLogo } from '../components/ui/VolleyballLoader';
import { MediaViewer } from '../components/media/MediaViewer';
import { PerformanceBadge, getPerformanceConfig } from '../components/ui/PerformanceBadge';
import {
  CheckCircle2,
  XCircle,
  Award,
  Trophy,
  ArrowLeft,
  RotateCcw,
  MessageSquareQuote,
  Clock,
  HelpCircle,
} from 'lucide-react';

interface TestResultPageProps {
  submission: any;
  onBackToDashboard: () => void;
  onRetry?: () => void;
}

export const TestResultPage: React.FC<TestResultPageProps> = ({
  submission,
  onBackToDashboard,
  onRetry,
}) => {
  useEffect(() => {
    if (submission?.passed) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#f43f5e', '#ffffff', '#fb7185'],
        });
      } catch {
        // ignore if canvas unavailable
      }
    }
  }, [submission]);

  if (!submission) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center text-white">
        <p>No se encontraron detalles del resultado.</p>
        <button onClick={onBackToDashboard} className="mt-4 px-4 py-2 rounded-full bg-rose-600">
          Volver
        </button>
      </div>
    );
  }

  const detailedAnswers = submission.detailedAnswers || submission.answers || [];
  const score = submission.score;
  const maxScore = submission.maxScore || detailedAnswers.length;
  const percentage = submission.percentage;
  const passed = submission.passed;

  const compThresh = submission.test?.competentThreshold ?? 60;
  const profThresh = submission.test?.professionalThreshold ?? 85;
  const level = submission.performanceLevel || (
    percentage >= profThresh
      ? 'PROFESIONAL'
      : percentage >= compThresh
      ? 'COMPETENTE'
      : 'PRINCIPIANTE'
  );
  const perfConfig = getPerformanceConfig(level);
  const PerfIcon = perfConfig.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Result Card Hero */}
      <div
        className={`rounded-3xl p-8 border shadow-2xl backdrop-blur-xl relative overflow-hidden ${
          passed
            ? 'bg-gradient-to-br from-emerald-900/80 via-emerald-800/70 to-stone-900/90 border-emerald-400/40'
            : 'bg-gradient-to-br from-rose-950/90 via-red-900/80 to-stone-900/90 border-rose-500/40'
        }`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-widest text-white">
                {passed ? '¡Evaluación Aprobada!' : 'Evaluación Completada'}
              </span>
              <PerformanceBadge level={level} size="sm" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              {submission.testTitle || submission.test?.title || 'Resultado de la Prueba'}
            </h1>
            <p className="text-sm text-stone-200 max-w-lg">
              {passed
                ? '¡Excelente desempeño táctico! Has demostrado un alto nivel de comprensión en las fases evaluadas.'
                : 'Buen intento. Revisa a continuación las observaciones y retroalimentación pedagógica para cada opción.'}
            </p>
          </div>

          {/* Big Circular Score Badge */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-black/40 border border-white/20 min-w-[170px] shadow-2xl">
            <span
              className={`text-5xl font-black tracking-tight ${
                passed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {percentage}%
            </span>
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider mt-1">
              {score} de {maxScore} puntos
            </span>
            <span className="text-[10px] text-stone-400 mt-0.5">
              Tiempo: {Math.round((submission.timeSpentSeconds || 0) / 60)} min
            </span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center sm:justify-start gap-4">
          <button
            onClick={onBackToDashboard}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-white text-stone-900 hover:bg-stone-100 font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Evaluaciones</span>
          </button>

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reintentar Prueba</span>
            </button>
          )}
        </div>
      </div>

      {/* Performance / Knowledge Level Card */}
      <div className={`p-6 sm:p-7 rounded-3xl border shadow-2xl backdrop-blur-xl bg-gradient-to-br ${perfConfig.cardBg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-stone-300">
                Calificación de Conocimiento
              </span>
              <PerformanceBadge level={level} size="md" />
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <PerfIcon className={`w-6 h-6 ${perfConfig.textColor}`} />
              <span>{perfConfig.title}</span>
            </h2>
            <p className="text-xs text-stone-200 max-w-xl leading-relaxed">
              {perfConfig.description}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center md:text-right flex-shrink-0">
            <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
              Escala de esta Evaluación
            </span>
            <div className="flex items-center justify-center md:justify-end space-x-2 text-[10px] font-mono">
              <span className="text-orange-300 font-bold">Principiante: &lt;{compThresh}%</span>
              <span className="text-stone-500">•</span>
              <span className="text-emerald-300 font-bold">Competente: ≥{compThresh}%</span>
              <span className="text-stone-500">•</span>
              <span className="text-amber-300 font-bold">Profesional: ≥{profThresh}%</span>
            </div>
            <span className="text-[11px] text-stone-300 block mt-1.5">
              Aciertos: <strong className="text-white">{percentage}%</strong> ({score}/{maxScore} preguntas)
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Question-by-Question Review with Option-Specific Feedback */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-rose-400" />
            <span>Retroalimentación Táctica y Pedagógica</span>
          </h2>
          <p className="text-xs text-rose-200 mt-1">
            Revisa el mensaje pedagógico correspondiente a la decisión que tomaste en cada jugada:
          </p>
        </div>

        <div className="space-y-6">
          {detailedAnswers.map((ans: any, index: number) => {
            const isCorrect = ans.isCorrect;
            const qTitle = ans.questionTitle || ans.question?.title || `Pregunta ${index + 1}`;
            const qContext = ans.questionContext || ans.question?.context;
            const categoryName = ans.categoryName || ans.question?.category?.name || 'Táctica';
            const userChoiceText = ans.selectedOptionText || ans.selectedOption?.text || 'Opción seleccionada';
            const feedback = ans.feedbackGiven || ans.selectedOption?.feedbackMessage || 'Sin comentarios registrados.';
            const imageUrl = ans.imageUrl || ans.question?.imageUrl;
            const videoUrl = ans.videoUrl || ans.question?.videoUrl;

            return (
              <div
                key={index}
                className={`p-6 sm:p-7 rounded-3xl border shadow-xl backdrop-blur-md transition-all ${
                  isCorrect
                    ? 'bg-emerald-950/30 border-emerald-500/30'
                    : 'bg-rose-950/30 border-rose-500/40'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-xs font-black flex items-center justify-center text-white">
                      {index + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-black/40 text-[10px] font-bold text-rose-200 uppercase">
                      {categoryName}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs font-black uppercase">
                    {isCorrect ? (
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Decisión Correcta</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-rose-400">
                        <XCircle className="w-4 h-4" />
                        <span>Decisión Subóptima</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question title */}
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                  {qTitle}
                </h3>

                {qContext && (
                  <p className="text-xs sm:text-sm text-stone-300 bg-black/20 p-3 rounded-xl border border-white/5 mb-3 italic">
                    “{qContext}”
                  </p>
                )}

                {/* Media preview if any */}
                {(imageUrl || videoUrl) && (
                  <div className="max-w-md my-3">
                    <MediaViewer imageUrl={imageUrl} videoUrl={videoUrl} title={qTitle} />
                  </div>
                )}

                {/* User's Chosen Option */}
                <div className="mt-3 p-3.5 rounded-2xl bg-black/40 border border-white/10">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                    Tu respuesta:
                  </span>
                  <p className="text-sm font-semibold text-white">
                    {userChoiceText}
                  </p>
                </div>

                {/* CRITICAL: Tailored Pedagogical Feedback Box */}
                <div
                  className={`mt-3 p-4 rounded-2xl border flex items-start space-x-3 ${
                    isCorrect
                      ? 'bg-emerald-900/40 border-emerald-400/40 text-emerald-100'
                      : 'bg-rose-900/40 border-rose-400/40 text-rose-100'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <MessageSquareQuote className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block mb-0.5">
                      {isCorrect ? 'Explicación del Acierto:' : 'Retroalimentación Pedagógica:'}
                    </span>
                    <p className="text-xs sm:text-sm leading-relaxed">
                      {feedback}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
