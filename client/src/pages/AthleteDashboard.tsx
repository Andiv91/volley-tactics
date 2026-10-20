import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TestSummary, Submission, Team } from '../types';
import { VolleyballLoader } from '../components/ui/VolleyballLoader';
import {
  Clock,
  HelpCircle,
  PlayCircle,
  AlertTriangle,
  Flame,
  Shield,
  History,
  Users,
  ArrowRight,
  X,
  Info,
} from 'lucide-react';

interface AthleteDashboardProps {
  onStartTest: (testId: string) => void;
  onViewHistory: () => void;
  onNavigateToTeam: () => void;
}

export const AthleteDashboard: React.FC<AthleteDashboardProps> = ({
  onStartTest,
  onViewHistory,
  onNavigateToTeam,
}) => {
  const { user } = useAuth();
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNoTeamModal, setShowNoTeamModal] = useState(false);
  const [pendingTest, setPendingTest] = useState<TestSummary | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, subsRes, teamRes] = await Promise.all([
          api.getTests(),
          api.getSubmissions(),
          api.getMyTeam().catch(() => ({ team: null })),
        ]);
        setTests(testsRes.tests || []);
        setMySubmissions(subsRes.submissions || []);
        setMyTeam(teamRes?.team || null);
      } catch (err) {
        console.error('Error cargando tests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <VolleyballLoader text="Cargando evaluaciones del equipo..." />;
  }

  const hasTeam = Boolean(myTeam || user?.teamId || user?.team);

  // Calcular estadísticas rápidas (1 por test único completado)
  const completedCount = new Set(mySubmissions.map((s) => s.testId)).size;
  const avgScore = mySubmissions.length > 0
    ? Math.round(mySubmissions.reduce((a, b) => a + b.percentage, 0) / mySubmissions.length)
    : 0;

  const handleAttemptStartTest = (test: TestSummary) => {
    if (!hasTeam) {
      setPendingTest(test);
      setShowNoTeamModal(true);
      return;
    }
    onStartTest(test.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900/90 via-red-800/80 to-rose-950/90 p-8 border border-white/20 shadow-2xl backdrop-blur-md">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-rose-200 text-xs font-bold uppercase tracking-wider mb-3">
              <img
                src="/icons/fondoblanco.png"
                alt="Balón"
                className="w-4 h-4 object-contain"
              />
              <span>VoleiTactics Académico</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Evaluaciones Tácticas y Toma de Decisión
            </h1>
            <p className="text-rose-100 text-sm mt-2 max-w-2xl leading-relaxed">
              Resuelve situaciones reales de juego ofensivo (K1), defensivo (K2), atención visual ante rematadores rivales y ética deportiva. Cada opción elegida te brindará retroalimentación detallada.
            </p>
          </div>

          {/* Athlete Fast Stats */}
          <div className="flex items-center gap-4">
            <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-center min-w-[110px]">
              <span className="block text-2xl font-black text-white">{completedCount}</span>
              <span className="text-[11px] font-semibold text-rose-200 uppercase">Completados</span>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-center min-w-[130px]">
              <span className="block text-2xl font-black text-emerald-400">{avgScore}%</span>
              <span className="text-[10px] font-semibold text-rose-200 uppercase">% Conocimiento (0-100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta Destacada Si Aún No Pertenece a un Equipo */}
      {!hasTeam && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-700/20 border-2 border-amber-400/40 p-6 backdrop-blur-md shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-wider">
                  Paso Previo Obligatorio
                </span>
                <span className="text-xs text-amber-200 font-semibold">Registro de Grupo</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                Debes seleccionar un equipo primero en la pestaña Equipos
              </h3>
              <p className="text-amber-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Busca el equipo que tu técnico haya creado antes de comenzar un examen. De esta forma tus respuestas y porcentaje de conocimiento se vincularán directamente a su grupo y él podrá auditar tus resultados.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToTeam}
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-400/30 flex-shrink-0"
          >
            <Users className="w-4 h-4" />
            <span>Ir a Equipos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Available Tests Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              <Flame className="w-6 h-6 text-rose-400" />
              <span>Evaluaciones Activas</span>
            </h2>
            <p className="text-xs text-rose-200 mt-0.5">
              Selecciona una prueba para iniciar tu evaluación de conocimientos tácticos
            </p>
          </div>

          {completedCount > 0 && (
            <button
              onClick={onViewHistory}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15"
            >
              <History className="w-4 h-4 text-rose-300" />
              <span>Ver mis resultados anteriores</span>
            </button>
          )}
        </div>

        {tests.length === 0 ? (
          <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10">
            <Shield className="w-12 h-12 text-rose-400 mx-auto mb-3 opacity-60" />
            <p className="text-stone-300 font-medium">No hay evaluaciones programadas en este momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => {
              const previousSub = mySubmissions.find((s) => s.testId === test.id);

              return (
                <div
                  key={test.id}
                  className="group flex flex-col justify-between rounded-3xl bg-white/10 hover:bg-white/15 transition-all duration-300 border border-white/15 hover:border-rose-400/50 p-6 shadow-xl backdrop-blur-md"
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-full bg-rose-600/80 text-white text-[10px] font-black uppercase tracking-wider">
                        {test.phase}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-rose-200">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{test.durationMinutes} min</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white group-hover:text-rose-200 transition-colors leading-snug">
                      {test.title}
                    </h3>

                    {test.description && (
                      <p className="text-xs text-rose-100/80 mt-2 line-clamp-2 leading-relaxed">
                        {test.description}
                      </p>
                    )}

                    {/* Topics covered */}
                    {test.categories && test.categories.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {test.categories.map((cat, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-black/30 border border-white/10 text-[10px] font-medium text-stone-200 truncate max-w-[200px]"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-xs text-rose-200 font-semibold">
                      <HelpCircle className="w-4 h-4 text-rose-400" />
                      <span>{test.questionCount} preguntas</span>
                    </div>

                    <button
                      onClick={() => handleAttemptStartTest(test)}
                      className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all ${
                        !hasTeam
                          ? 'bg-amber-600 hover:bg-amber-500 hover:shadow-amber-600/40'
                          : 'bg-rose-600 hover:bg-rose-500 hover:shadow-rose-600/40'
                      }`}
                    >
                      {!hasTeam ? (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-200" />
                          <span>Comenzar</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          <span>{previousSub ? 'Reintentar' : 'Comenzar'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Informativo: Debes seleccionar un equipo primero */}
      {showNoTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#3a0a13] to-[#1c0408] border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Close button */}
            <button
              onClick={() => setShowNoTeamModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon & Title */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                Paso Obligatorio
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Debes seleccionar un equipo primero
              </h3>

              <p className="text-amber-100 text-sm leading-relaxed max-w-md">
                Debes seleccionar un equipo primero en la pestaña <strong className="text-amber-300">Equipos</strong>, busca el que tu técnico haya creado.
              </p>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs text-rose-200/90 text-left w-full space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>¿Por qué es indispensable este paso?</span>
                </p>
                <p className="text-[11.5px] leading-relaxed text-stone-300">
                  Si no te unes al equipo de tu profesor, tus respuestas y porcentaje de conocimiento no se vincularán a su grupo y él no podrá auditar tus resultados ni ver tus estadísticas.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setShowNoTeamModal(false);
                  onNavigateToTeam();
                }}
                className="flex-1 inline-flex items-center justify-center space-x-2 py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25"
              >
                <Users className="w-4 h-4" />
                <span>Ir a la pestaña Equipos</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowNoTeamModal(false)}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
