import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AnalyticsData, User } from '../../types';
import { VolleyballLoader } from '../../components/ui/VolleyballLoader';
import { TopicPieChart } from '../../components/charts/TopicPieChart';
import {
  PieChart as PieChartIcon,
  User as UserIcon,
  Users,
  Award,
  BarChart2,
  Filter,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadData = async (userIdFilter?: string) => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        api.getAnalytics(userIdFilter || undefined),
        api.getAllUsers(),
      ]);
      setAnalytics(analyticsRes);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.error('Error cargando analíticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedUserId);
  }, [selectedUserId]);

  if (loading || !analytics) {
    return <VolleyballLoader text="Calculando gráficos circulares por categorías..." />;
  }

  const selectedAthlete = users.find((u) => u.id === selectedUserId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Athlete Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">
            Estadísticas & Gráficos Circulares
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <PieChartIcon className="w-8 h-8 text-rose-400" />
            <span>Categorización del Conocimiento</span>
          </h1>
          <p className="text-xs sm:text-sm text-rose-200 mt-1">
            Visualiza mediante diagramas circulares cuánto sabe cada atleta o el equipo sobre cada dimensión táctica evaluada.
          </p>
        </div>

        {/* Athlete Selector Dropdown */}
        <div className="flex items-center space-x-3 bg-white/10 p-2.5 rounded-2xl border border-white/15">
          <UserIcon className="w-4 h-4 text-rose-300 ml-2" />
          <span className="text-xs font-bold text-white whitespace-nowrap">Filtrar Atleta:</span>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-white/20 text-white text-xs font-medium focus:ring-2 focus:ring-rose-500"
          >
            <option value="">Todo el Equipo (Cohorte General)</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Athlete Banner if single user chosen */}
      {selectedAthlete && (
        <div className="p-4 rounded-2xl bg-rose-900/40 border border-rose-500/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={
                selectedAthlete.avatarUrl &&
                !selectedAthlete.avatarUrl.includes('dicebear') &&
                !selectedAthlete.avatarUrl.includes('avatar-generic') &&
                !selectedAthlete.avatarUrl.includes('unsplash.com') &&
                !selectedAthlete.avatarUrl.startsWith('data:image/png;base64,iVBOR')
                  ? selectedAthlete.avatarUrl
                  : '/icons/icondefault.png'
              }
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-white/40 object-cover bg-stone-900 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/icons/icondefault.png';
              }}
            />
            <div>
              <p className="text-sm font-black text-white">{selectedAthlete.name}</p>
              <p className="text-xs text-rose-200">{selectedAthlete.email}</p>
            </div>
          </div>

          <button
            onClick={() => setSelectedUserId('')}
            className="text-xs text-stone-300 hover:text-white underline font-semibold"
          >
            Ver métricas globales del equipo
          </button>
        </div>
      )}

      {/* Main Section: Circular Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* The Circular Pie Chart (Primary Focus) */}
        <div className="lg:col-span-8">
          <TopicPieChart
            data={analytics.circularPieData}
            title={
              selectedAthlete
                ? `Dominio Táctico: ${selectedAthlete.name}`
                : 'Dominio Táctico: Promedio del Equipo Universitario'
            }
            subtitle="Porcentaje de asertividad categorizado por tema (K1, K2, Percepción, Decisiones)"
          />
        </div>

        {/* Difficulty Breakdown and Insights */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Difficulty Cards */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-rose-400" />
              <span>Efectividad por Nivel de Dificultad</span>
            </h3>

            <div className="space-y-4 pt-1">
              {analytics.difficultyBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-200">{item.difficulty}</span>
                    <span className="text-white font-black">{item.accuracy}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.difficulty === 'PRINCIPIANTE'
                          ? 'bg-emerald-500'
                          : item.difficulty === 'INTERMEDIO'
                          ? 'bg-blue-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.accuracy}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 block text-right">
                    {item.totalAnswered} respuestas evaluadas
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Squad Performance List */}
          {!selectedAthlete && analytics.userSummaries.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                <span>Rendimiento por Atleta</span>
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {analytics.userSummaries.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className="p-2.5 rounded-xl bg-black/30 hover:bg-black/50 border border-white/10 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="overflow-hidden mr-2">
                      <p className="text-xs font-bold text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-stone-400">{u.testsCompleted} tests</p>
                    </div>
                    <span className="text-xs font-black text-rose-300">
                      {u.averagePercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
