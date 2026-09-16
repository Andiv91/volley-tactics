import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AnalyticsData, Submission } from '../../types';
import { VolleyballLoader } from '../../components/ui/VolleyballLoader';
import { TopicPieChart } from '../../components/charts/TopicPieChart';
import {
  Users,
  Award,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  FileText,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onInspectSubmission: (submission: Submission) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onInspectSubmission,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentSubs, setRecentSubs] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, subsRes] = await Promise.all([
        api.getAnalytics(),
        api.getSubmissions(),
      ]);
      setAnalytics(analyticsRes);
      setRecentSubs(subsRes.submissions?.slice(0, 5) || []);
    } catch (err: any) {
      console.error('Error cargando métricas de admin:', err);
      setError(err?.message || 'No se pudieron obtener las métricas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <VolleyballLoader text="Calculando métricas del equipo..." />;
  }

  if (error && !analytics) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-white">
        <p className="text-sm text-rose-200 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-2 rounded-full bg-rose-600 hover:bg-rose-500 font-bold text-xs uppercase tracking-wider transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const defaultKpis = {
    totalAthletes: 0,
    totalTests: 0,
    totalSubmissions: 0,
    averageScore: 0,
    passRate: 0,
  };

  const kpis = analytics?.kpis || defaultKpis;
  const circularPieData = analytics?.circularPieData || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">
            Panel de Control Técnico
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Resumen General de Rendimiento
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('admin-questions')}
            className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
          >
            + Nueva Pregunta
          </button>
          <button
            onClick={() => onNavigate('admin-tests')}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/15"
          >
            + Crear Evaluación
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-200 uppercase">Atletas Registrados</span>
            <p className="text-2xl font-black text-white">{kpis.totalAthletes}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-200 uppercase">Tasa de Aprobación</span>
            <p className="text-2xl font-black text-white">{kpis.passRate}%</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-200 uppercase">Evaluaciones Realizadas</span>
            <p className="text-2xl font-black text-white">{kpis.totalSubmissions}</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl flex items-center space-x-4">
          <div className="p-3.5 rounded-2xl bg-amber-600/30 text-amber-400 border border-amber-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-rose-200 uppercase">Promedio Global</span>
            <p className="text-2xl font-black text-white">{kpis.averageScore}%</p>
          </div>
        </div>
      </div>

      {/* Main Section: Circular Pie Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Circular Pie Chart (Left 7 Cols) */}
        <div className="lg:col-span-7">
          <TopicPieChart
            data={circularPieData}
            title="Distribución de Dominio por Área Táctica"
            subtitle="Porcentaje de aciertos agrupados por categorías (K1, K2, Percepción, Decisiones)"
          />
        </div>

        {/* Recent Submissions Activity (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white tracking-wide">Últimas Entregas</h3>
              <button
                onClick={() => onNavigate('admin-results')}
                className="text-xs text-rose-300 hover:text-white font-semibold flex items-center space-x-1"
              >
                <span>Ver todas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentSubs.length === 0 ? (
              <p className="text-stone-300 text-xs py-8 text-center">No hay registros de evaluaciones aún.</p>
            ) : (
              <div className="space-y-3">
                {recentSubs.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onInspectSubmission(sub)}
                    className="p-3 rounded-2xl bg-black/25 hover:bg-black/40 border border-white/10 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="overflow-hidden mr-2">
                      <p className="text-xs font-bold text-white truncate">
                        {sub.user?.name || sub.userName || 'Atleta'}
                      </p>
                      <p className="text-[11px] text-rose-200 truncate">
                        {sub.test?.title || sub.testTitle || 'Evaluación'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          sub.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {sub.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-white/10 text-center">
            <button
              onClick={() => onNavigate('admin-analytics')}
              className="w-full py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all"
            >
              Explorar Analíticas Detalladas y Filtrado por Atleta
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
