import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Submission, AnalyticsData } from '../types';
import { VolleyballLoader } from '../components/ui/VolleyballLoader';
import { TopicPieChart } from '../components/charts/TopicPieChart';
import { useAuth } from '../context/AuthContext';
import {
  History,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  PieChart,
} from 'lucide-react';

interface AthleteHistoryPageProps {
  onInspectSubmission: (submission: Submission) => void;
}

export const AthleteHistoryPage: React.FC<AthleteHistoryPageProps> = ({ onInspectSubmission }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subsRes, analyticsRes] = await Promise.all([
          api.getSubmissions(),
          api.getAnalytics(user?.id),
        ]);
        setSubmissions(subsRes.submissions || []);
        setAnalytics(analyticsRes);
      } catch (err) {
        console.error('Error al cargar historial:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  if (loading) {
    return <VolleyballLoader text="Cargando tu historial y gráficos circulares..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
          <History className="w-8 h-8 text-rose-400" />
          <span>Mis Resultados y Progreso Táctico</span>
        </h1>
        <p className="text-xs sm:text-sm text-rose-200 mt-1">
          Historial de evaluaciones completadas y distribución de conocimientos por área
        </p>
      </div>

      {/* Circular Pie Chart for this Athlete */}
      {analytics && analytics.circularPieData.length > 0 && (
        <div className="max-w-3xl">
          <TopicPieChart
            data={analytics.circularPieData}
            title="Mi Dominio Táctico Personal"
            subtitle="Porcentaje de asertividad en tus respuestas por categoría"
          />
        </div>
      )}

      {/* Submissions List */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-4">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider">
          Pruebas Realizadas ({submissions.length})
        </h2>

        {submissions.length === 0 ? (
          <p className="text-stone-300 text-sm py-6 text-center">
            Aún no has completado ninguna evaluación táctica.
          </p>
        ) : (
          <div className="divide-y divide-white/10">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 px-3 rounded-2xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">
                      {sub.test?.title || sub.testTitle || 'Evaluación'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] text-rose-200 uppercase font-semibold">
                      {sub.test?.phase || 'Fase Táctica'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-stone-300">
                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-rose-300" />
                      <span>{Math.round((sub.timeSpentSeconds || 0) / 60)} min</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1.5 font-black text-base">
                      {sub.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span className={sub.passed ? 'text-emerald-400' : 'text-rose-400'}>
                        {sub.percentage}%
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-400 block">
                      {sub.score} de {sub.maxScore} aciertos
                    </span>
                  </div>

                  <button
                    onClick={() => onInspectSubmission(sub)}
                    className="flex items-center space-x-1 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <span>Ver Detalles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
