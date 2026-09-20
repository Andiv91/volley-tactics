import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Submission, User, TestSummary, Team, PerformanceLevel } from '../../types';
import { VolleyballLoader } from '../../components/ui/VolleyballLoader';
import { PerformanceBadge } from '../../components/ui/PerformanceBadge';
import {
  FileCheck2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  MessageSquareQuote,
  User as UserIcon,
  X,
  Users,
  Plus,
  Trash2,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const ResultsExplorer: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedUserFilter, setSelectedUserFilter] = useState('');
  const [selectedTestFilter, setSelectedTestFilter] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Submission for Detailed Audit Modal
  const [auditSubmission, setAuditSubmission] = useState<any | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Team Management Modal
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [subsRes, usersRes, testsRes, teamsRes] = await Promise.all([
        api.getSubmissions({
          userId: selectedUserFilter || undefined,
          testId: selectedTestFilter || undefined,
          teamId: selectedTeamFilter || undefined,
        }),
        api.getAllUsers(),
        api.getTests(),
        api.getTeams(),
      ]);
      setSubmissions(subsRes.submissions || []);
      setUsers(usersRes.users || []);
      setTests(testsRes.tests || []);
      setTeams(teamsRes.teams || []);
    } catch (err) {
      console.error('Error cargando resultados y filtros:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedUserFilter, selectedTestFilter, selectedTeamFilter]);

  const handleOpenAudit = async (submissionId: string) => {
    setLoadingAudit(true);
    try {
      const res = await api.getSubmissionById(submissionId);
      setAuditSubmission(res.submission);
    } catch (err) {
      console.error('Error obteniendo detalle de auditoría:', err);
      alert('No se pudo cargar el detalle de la entrega.');
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      alert('El nombre del equipo es obligatorio');
      return;
    }

    setCreatingTeam(true);
    try {
      await api.createTeam({
        name: newTeamName.trim(),
        description: newTeamDesc.trim() || undefined,
      });
      setNewTeamName('');
      setNewTeamDesc('');
      const updatedTeams = await api.getTeams();
      setTeams(updatedTeams.teams || []);
      alert('¡Equipo creado exitosamente!');
    } catch (err: any) {
      alert(err.message || 'Error al crear equipo');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el equipo "${teamName}"? Los atletas quedarán sin equipo asignado.`)) {
      return;
    }

    setDeletingTeamId(teamId);
    try {
      await api.deleteTeam(teamId);
      if (selectedTeamFilter === teamId) {
        setSelectedTeamFilter('');
      }
      const updatedTeams = await api.getTeams();
      setTeams(updatedTeams.teams || []);
      await loadData();
      alert('Equipo eliminado correctamente');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar equipo');
    } finally {
      setDeletingTeamId(null);
    }
  };

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    if (selectedUserFilter && sub.userId !== selectedUserFilter && sub.user?.id !== selectedUserFilter) return false;
    if (selectedTestFilter && sub.testId !== selectedTestFilter && sub.test?.id !== selectedTestFilter) return false;
    if (selectedLevelFilter && sub.performanceLevel !== selectedLevelFilter) return false;
    if (selectedTeamFilter) {
      const teamId = sub.user?.teamId || sub.user?.team?.id;
      if (teamId !== selectedTeamFilter) return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const athleteName = sub.user?.name || sub.userName || '';
    const athleteEmail = sub.user?.email || sub.userEmail || '';
    const testName = sub.test?.title || sub.testTitle || '';
    const teamName = sub.user?.team?.name || '';
    return (
      athleteName.toLowerCase().includes(q) ||
      athleteEmail.toLowerCase().includes(q) ||
      testName.toLowerCase().includes(q) ||
      teamName.toLowerCase().includes(q)
    );
  });

  // Calculate Consolidated Team Metrics when a team is selected
  const selectedTeamObj = teams.find((t) => t.id === selectedTeamFilter);
  const teamSubmissions = selectedTeamFilter
    ? submissions.filter((s) => (s.user?.teamId === selectedTeamFilter || s.user?.team?.id === selectedTeamFilter))
    : [];
  const teamMembers = selectedTeamFilter
    ? users.filter((u) => (u.teamId === selectedTeamFilter || (u.team as any)?.id === selectedTeamFilter))
    : [];

  const totalTeamEvaluations = teamSubmissions.length;
  const avgTeamScore = totalTeamEvaluations > 0
    ? Math.round(teamSubmissions.reduce((acc, s) => acc + s.percentage, 0) / totalTeamEvaluations)
    : 0;

  let teamOverallLevel: PerformanceLevel = 'PRINCIPIANTE';
  if (avgTeamScore >= 85) teamOverallLevel = 'PROFESIONAL';
  else if (avgTeamScore >= 60) teamOverallLevel = 'COMPETENTE';

  const teamLevelCounts = {
    principiante: teamSubmissions.filter((s) => s.performanceLevel === 'PRINCIPIANTE').length,
    competente: teamSubmissions.filter((s) => s.performanceLevel === 'COMPETENTE').length,
    profesional: teamSubmissions.filter((s) => s.performanceLevel === 'PROFESIONAL').length,
  };

  if (loading) {
    return <VolleyballLoader text="Cargando historial de respuestas y auditoría..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header with Team Management Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">
            Auditoría de Jugadores & Equipos
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-8 h-8 text-rose-400" />
            <span>Resultados y Registro de Respuestas</span>
          </h1>
          <p className="text-xs sm:text-sm text-rose-200 mt-1">
            Supervisa en detalle cada decisión táctica individual o consolidada por escuadra deportiva.
          </p>
        </div>

        {/* Botón para Crear y Gestionar Equipos */}
        <button
          onClick={() => setShowTeamModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white text-rose-900 hover:bg-rose-100 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 self-start md:self-auto"
        >
          <Users className="w-4 h-4 text-rose-700" />
          <span>Gestionar / Crear Equipos</span>
        </button>
      </div>

      {/* Filter Bar with Team Search & Select */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/15 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search by athlete, test, or team name */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por atleta, evaluación o equipo..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-black/40 border border-white/15 text-white placeholder-stone-400 text-xs focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Team Filter */}
        <div>
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-2xl bg-black/40 border border-white/15 text-white text-xs font-semibold"
          >
            <option value="">Todos los Equipos</option>
            {teams.map((tm) => (
              <option key={tm.id} value={tm.id}>
                {tm.name} ({tm.memberCount || 0} integrantes)
              </option>
            ))}
          </select>
        </div>

        {/* User Filter */}
        <div>
          <select
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-2xl bg-black/40 border border-white/15 text-white text-xs"
          >
            <option value="">Todos los Atletas</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Test Filter */}
        <div>
          <select
            value={selectedTestFilter}
            onChange={(e) => setSelectedTestFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-2xl bg-black/40 border border-white/15 text-white text-xs"
          >
            <option value="">Todas las Evaluaciones</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Panel de Resultados Consolidados por Equipo (cuando se filtra un equipo) */}
      {selectedTeamObj && (
        <div className="bg-gradient-to-r from-rose-950/70 via-stone-900/70 to-rose-950/70 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                  Resultados Consolidados del Equipo
                </span>
                <span className="text-xs text-rose-200">
                  {selectedTeamObj.memberCount || teamMembers.length} integrantes inscritos
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                {selectedTeamObj.name}
              </h2>
              {selectedTeamObj.description && (
                <p className="text-xs text-stone-300">{selectedTeamObj.description}</p>
              )}
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[10px] font-bold text-stone-400 uppercase mb-1">
                Nivel Táctico Consolidado:
              </span>
              <PerformanceBadge level={teamOverallLevel} size="md" />
            </div>
          </div>

          {/* Estadísticas Clave del Equipo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">
                Evaluaciones Entregadas
              </span>
              <span className="text-xl font-black text-white mt-1 block">
                {totalTeamEvaluations}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/10">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">
                Asertividad Promedio
              </span>
              <span className="text-xl font-black text-rose-300 mt-1 block">
                {avgTeamScore}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/10 col-span-2 sm:col-span-2">
              <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                Distribución por Niveles
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {teamLevelCounts.profesional} Profesional
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {teamLevelCounts.competente} Competente
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {teamLevelCounts.principiante} Principiante
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-200">
            <thead className="bg-black/40 uppercase tracking-wider text-[11px] font-bold text-rose-300 border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Atleta & Equipo</th>
                <th className="py-4 px-6">Evaluación</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6">Efectividad</th>
                <th className="py-4 px-6">Nivel Táctico</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Auditar Respuestas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No se encontraron entregas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => {
                  const teamName = sub.user?.team?.name || '';
                  return (
                    <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-semibold text-white">
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={
                              sub.user?.avatarUrl &&
                              !sub.user.avatarUrl.includes('dicebear') &&
                              !sub.user.avatarUrl.includes('avatar-generic') &&
                              !sub.user.avatarUrl.includes('unsplash.com') &&
                              !sub.user.avatarUrl.startsWith('data:image/png;base64,iVBOR')
                                ? sub.user.avatarUrl
                                : '/icons/icondefault.png'
                            }
                            alt="avatar"
                            className="w-8 h-8 rounded-full border border-white/30 object-cover bg-stone-900 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/icons/icondefault.png';
                            }}
                          />
                          <div>
                            <p className="font-bold text-white">{sub.user?.name || sub.userName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {teamName ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-600/30 text-rose-300 border border-rose-500/40">
                                  {teamName}
                                </span>
                              ) : (
                                <span className="text-[9px] text-stone-400 italic">
                                  Sin equipo
                                </span>
                              )}
                              <span className="text-[9px] text-stone-400">• {sub.user?.email || sub.userEmail}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-medium">
                        {sub.test?.title || sub.testTitle}
                      </td>

                      <td className="py-4 px-6 text-stone-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-black text-sm text-white">
                          {sub.percentage}%
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          {sub.score}/{sub.maxScore} pts
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <PerformanceBadge level={sub.performanceLevel} size="sm" />
                      </td>

                      <td className="py-4 px-6">
                        {sub.passed ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aprobado</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] uppercase">
                            <XCircle className="w-3 h-3" />
                            <span>No Aprobado</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenAudit(sub.id)}
                          className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver Respuestas</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Crear y Gestionar Equipos (Dentro de Auditoría) */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-stone-900 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider">
                  Módulo de Auditoría
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 flex items-center gap-2">
                  <Users className="w-6 h-6 text-rose-400" />
                  <span>Crear y Administrar Equipos</span>
                </h2>
                <p className="text-xs text-stone-300 mt-1">
                  Registra nuevas escuadras para que los atletas puedan afiliarse y analizar sus resultados colectivos.
                </p>
              </div>

              <button
                onClick={() => setShowTeamModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario de Creación de Equipo */}
            <form onSubmit={handleCreateTeam} className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-3">
              <h3 className="text-xs font-black uppercase text-rose-300 tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Equipo Deportivo</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Nombre del Equipo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Ej. Selección Femenina A"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/15 text-white text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-300 block mb-1">
                    Descripción / Categoría
                  </label>
                  <input
                    type="text"
                    value={newTeamDesc}
                    onChange={(e) => setNewTeamDesc(e.target.value)}
                    placeholder="Ej. Titulares universitarios"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-white/15 text-white text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={creatingTeam}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                >
                  {creatingTeam ? 'Guardando...' : 'Crear Equipo'}
                </button>
              </div>
            </form>

            {/* Listado de Equipos Registrados */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase text-white tracking-wider">
                Equipos Registrados ({teams.length})
              </h3>

              {teams.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No hay equipos registrados aún.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {teams.map((tm) => (
                    <div
                      key={tm.id}
                      className="p-3 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between hover:bg-black/50 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{tm.name}</h4>
                          <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40">
                            {tm.memberCount || 0} Atletas
                          </span>
                        </div>
                        {tm.description && (
                          <p className="text-[11px] text-stone-300 mt-0.5">{tm.description}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteTeam(tm.id, tm.name)}
                        disabled={deletingTeamId === tm.id}
                        className="p-2 rounded-xl hover:bg-rose-900/50 text-stone-400 hover:text-rose-300 transition-colors"
                        title="Eliminar equipo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowTeamModal(false)}
                className="px-6 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs uppercase"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AUDIT MODAL: Full question-by-question inspect */}
      {auditSubmission && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-stone-900 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-300 tracking-wider">
                  Auditoría Detallada de Respuestas
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {auditSubmission.test?.title || auditSubmission.testTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-300 mt-1.5">
                  <span className="font-bold text-white">
                    Atleta: {auditSubmission.user?.name || auditSubmission.userName}
                  </span>
                  {auditSubmission.user?.team?.name && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                      {auditSubmission.user.team.name}
                    </span>
                  )}
                  <span className="text-stone-500">•</span>
                  <span>Efectividad: {auditSubmission.percentage}%</span>
                  <span className="text-stone-500">•</span>
                  <PerformanceBadge level={auditSubmission.performanceLevel} size="sm" />
                  <span className="text-stone-500">•</span>
                  <span>{new Date(auditSubmission.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setAuditSubmission(null)}
                className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions & Feedback Audit List */}
            <div className="space-y-4">
              {auditSubmission.answers?.map((ans: any, idx: number) => {
                const isCorrect = ans.isCorrect;
                const qTitle = ans.question?.title || `Pregunta ${idx + 1}`;
                const qContext = ans.question?.context;
                const choiceText = ans.selectedOption?.text || ans.selectedOptionText || 'Sin respuesta';
                const feedback = ans.feedbackGiven || ans.selectedOption?.feedbackMessage || '';

                return (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border ${
                      isCorrect ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-rose-950/30 border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white">
                        Pregunta #{idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {isCorrect ? 'Acertada' : 'Fallida'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1">{qTitle}</h4>
                    {qContext && (
                      <p className="text-xs text-stone-300 italic mb-2">“{qContext}”</p>
                    )}

                    {/* Option Chosen */}
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs mb-2">
                      <span className="text-[10px] font-bold text-stone-400 block uppercase">
                        Opción seleccionada por el atleta:
                      </span>
                      <p className="font-semibold text-white mt-0.5">{choiceText}</p>
                    </div>

                    {/* Feedback Given */}
                    <div className="p-3 rounded-xl bg-black/25 border border-white/10 flex items-start space-x-2 text-xs">
                      <MessageSquareQuote className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-bold text-rose-300 block uppercase">
                          Retroalimentación recibida:
                        </span>
                        <p className="text-stone-200 mt-0.5">{feedback}</p>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setAuditSubmission(null)}
                className="px-6 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs uppercase"
              >
                Cerrar Auditoría
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
