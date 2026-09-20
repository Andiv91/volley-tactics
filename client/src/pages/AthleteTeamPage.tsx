import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Team } from '../types';
import { VolleyballLoader } from '../components/ui/VolleyballLoader';
import { PerformanceBadge } from '../components/ui/PerformanceBadge';
import {
  Users,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRightLeft,
  LogOut,
  UserCheck,
  Info,
} from 'lucide-react';

export const AthleteTeamPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningTeamId, setJoiningTeamId] = useState<string | null>(null);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [myTeamRes, allTeamsRes] = await Promise.all([
        api.getMyTeam(),
        api.getTeams(),
      ]);
      setMyTeam(myTeamRes.team);
      setAllTeams(allTeamsRes.teams || []);
    } catch (err) {
      console.error('Error cargando información de equipo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJoinTeam = async (teamId: string | null) => {
    try {
      setJoiningTeamId(teamId || 'leaving');
      const res = await api.joinTeam(teamId);
      updateUser(res.user);
      await loadData();
      setShowSwitchModal(false);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar equipo');
    } finally {
      setJoiningTeamId(null);
    }
  };

  if (loading) {
    return <VolleyballLoader text="Cargando escuadra y compañeros de equipo..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">
            Comunidad & Escuadra Deportiva
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <Users className="w-8 h-8 text-rose-400" />
            <span>Mi Equipo de Voleibol</span>
          </h1>
          <p className="text-xs sm:text-sm text-rose-200 mt-1">
            Conoce a tus compañeros de equipo, revisa el nivel táctico global y mantente sincronizado.
          </p>
        </div>

        {myTeam && (
          <button
            onClick={() => setShowSwitchModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 transition-all self-start md:self-auto"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-rose-300" />
            <span>Cambiar de Equipo</span>
          </button>
        )}
      </div>

      {/* Si aún no tiene equipo */}
      {!myTeam ? (
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-rose-600/30 border border-rose-400/40 rounded-3xl mx-auto flex items-center justify-center">
            <Users className="w-8 h-8 text-rose-300" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase">
              Aún no perteneces a un equipo
            </h2>
            <p className="text-xs sm:text-sm text-rose-200">
              Selecciona tu escuadra deportiva creada por el cuerpo técnico para sumarte a sus estadísticas y ver a tus compañeros.
            </p>
          </div>

          {allTeams.length === 0 ? (
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10 max-w-md mx-auto text-xs text-stone-300">
              El entrenador aún no ha registrado equipos en la plataforma. Consulta con el cuerpo técnico en Auditoría.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto text-left">
              {allTeams.map((team) => (
                <div
                  key={team.id}
                  className="bg-black/40 border border-white/15 rounded-2xl p-5 flex flex-col justify-between hover:border-rose-500/60 transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider">
                        {team.memberCount || 0} Integrantes
                      </span>
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                    </div>
                    <h3 className="text-base font-black text-white">{team.name}</h3>
                    {team.description && (
                      <p className="text-xs text-stone-300 mt-1.5 line-clamp-2">
                        {team.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={joiningTeamId === team.id}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    {joiningTeamId === team.id ? 'Uniéndote...' : 'Unirme a este Equipo'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Si ya tiene equipo */
        <div className="space-y-6">
          
          {/* Card Principal del Equipo con Nivel Táctico Consolidado */}
          <div className="bg-gradient-to-r from-rose-950/60 via-stone-900/60 to-rose-950/60 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-black uppercase text-rose-400 tracking-widest">
                  Escuadra Oficial
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                  {myTeam.name}
                </h2>
                {myTeam.description && (
                  <p className="text-xs sm:text-sm text-stone-300 mt-1">
                    {myTeam.description}
                  </p>
                )}
              </div>

              {/* Distintivo de Nivel Táctico Grupal */}
              {myTeam.stats && (
                <div className="flex flex-col sm:items-end">
                  <span className="text-[10px] font-bold text-stone-400 uppercase mb-1">
                    Nivel Táctico del Equipo:
                  </span>
                  <PerformanceBadge level={myTeam.stats.performanceLevel} size="lg" />
                </div>
              )}
            </div>

            {/* Métricas Grupales */}
            {myTeam.stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-center">
                <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">
                    Compañeros
                  </span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {myTeam.memberCount}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">
                    Efectividad Media
                  </span>
                  <span className="text-xl font-black text-rose-300 mt-1 block">
                    {myTeam.stats.averagePercentage}%
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">
                    Tests Completados
                  </span>
                  <span className="text-xl font-black text-white mt-1 block">
                    {myTeam.stats.totalEvaluations}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">
                    Clasificación
                  </span>
                  <span className="text-xs font-extrabold text-amber-300 mt-2 block uppercase">
                    {myTeam.stats.performanceLevel}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Compañeros de Equipo */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-rose-400" />
                  <span>Nómina de Jugadores ({myTeam.members?.length || 0})</span>
                </h3>
                <p className="text-xs text-rose-200 mt-0.5">
                  Atletas registrados en esta escuadra universitaria
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {myTeam.members?.map((member) => {
                const isMe = member.id === user?.id;
                const avatar = member.avatarUrl &&
                  !member.avatarUrl.includes('dicebear') &&
                  !member.avatarUrl.includes('avatar-generic') &&
                  !member.avatarUrl.includes('unsplash.com') &&
                  !member.avatarUrl.startsWith('data:image/png;base64,iVBOR')
                    ? member.avatarUrl
                    : '/icons/icondefault.png';

                return (
                  <div
                    key={member.id}
                    className={`p-3.5 rounded-2xl border flex items-center space-x-3 transition-all ${
                      isMe
                        ? 'bg-rose-950/40 border-rose-500/50 shadow-md'
                        : 'bg-black/30 border-white/10 hover:bg-black/40'
                    }`}
                  >
                    <img
                      src={avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full border border-white/30 object-cover bg-stone-900 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/icondefault.png';
                      }}
                    />

                    <div className="flex-grow overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black text-white truncate">
                          {member.name}
                        </p>
                        {isMe && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-rose-600 text-white flex-shrink-0">
                            Tú
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-400 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Modal para Cambiar de Equipo */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-stone-900 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-300 tracking-widest">
                  Gestión de Escuadra
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  Cambiar de Equipo
                </h3>
                <p className="text-xs text-stone-300">
                  Selecciona otro equipo o retírate para quedar como agente libre.
                </p>
              </div>

              <button
                onClick={() => setShowSwitchModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {allTeams.map((t) => {
                const isCurrent = t.id === myTeam?.id;
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isCurrent
                        ? 'bg-rose-950/40 border-rose-500/60'
                        : 'bg-black/30 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{t.name}</h4>
                        {isCurrent && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Equipo Actual
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-xs text-stone-300 mt-0.5">{t.description}</p>
                      )}
                      <span className="text-[10px] text-stone-400 block mt-1">
                        {t.memberCount || 0} integrantes
                      </span>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => handleJoinTeam(t.id)}
                        disabled={joiningTeamId === t.id}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all"
                      >
                        {joiningTeamId === t.id ? 'Cambiando...' : 'Seleccionar'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => handleJoinTeam(null)}
                disabled={joiningTeamId === 'leaving'}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-black/40 hover:bg-rose-950/60 text-xs font-semibold text-rose-300 border border-rose-500/30 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir del Equipo (Agente Libre)</span>
              </button>

              <button
                onClick={() => setShowSwitchModal(false)}
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white"
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
