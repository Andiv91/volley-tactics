import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TestSummary, Submission } from '../types';
import { VolleyballLoader } from '../components/ui/VolleyballLoader';
import {
  Clock,
  HelpCircle,
  Award,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  History,
} from 'lucide-react';

interface AthleteDashboardProps {
  onStartTest: (testId: string) => void;
  onViewHistory: () => void;
}

export const AthleteDashboard: React.FC<AthleteDashboardProps> = ({ onStartTest, onViewHistory }) => {
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, subsRes] = await Promise.all([
          api.getTests(),
          api.getSubmissions(),
        ]);
        setTests(testsRes.tests || []);
        setMySubmissions(subsRes.submissions || []);
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

  // Calcular estadísticas rápidas (1 por test único completado)
  const completedCount = new Set(mySubmissions.map((s) => s.testId)).size;
  const avgScore = mySubmissions.length > 0
    ? Math.round(mySubmissions.reduce((a, b) => a + b.percentage, 0) / mySubmissions.length)
    : 0;

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

            <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-center min-w-[110px]">
              <span className="block text-2xl font-black text-emerald-400">{avgScore}%</span>
              <span className="text-[11px] font-semibold text-rose-200 uppercase">Efectividad</span>
            </div>
          </div>
        </div>
      </div>

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
                      onClick={() => onStartTest(test.id)}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-rose-600/40 transition-all"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>{previousSub ? 'Reintentar' : 'Comenzar'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
