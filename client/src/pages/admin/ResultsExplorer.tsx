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
  UserPlus,
  ArrowLeft,
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
  const [selectedTeamToManage, setSelectedTeamToManage] = useState<Team | null>(null);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
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

  const loadAvailableStudents = async () => {
    try {
      const res = await api.getAvailableStudents();
      setAvailableStudents(res.students || []);
    } catch (err) {
      console.error('Error cargando estudiantes disponibles:', err);
    }
  };

  const handleOpenTeamModal = async () => {
    setSelectedTeamToManage(null);
    setShowTeamModal(true);
    await loadAvailableStudents();
  };

  const handleSelectTeamToManage = (team: Team) => {
    setSelectedTeamToManage(team);
    setSelectedStudentToAdd('');
  };

  const handleAddStudentToTeam = async () => {
    if (!selectedTeamToManage || !selectedStudentToAdd) return;
    setAddingStudent(true);
    try {
      await api.addTeamMember(selectedTeamToManage.id, selectedStudentToAdd);
      const updatedTeams = await api.getTeams();
      setTeams(updatedTeams.teams || []);
      const refreshedTeam = (updatedTeams.teams || []).find((t) => t.id === selectedTeamToManage.id);
      setSelectedTeamToManage(refreshedTeam || null);
      setSelectedStudentToAdd('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al agregar estudiante al equipo');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudentFromTeam = async (studentId: string) => {
    if (!selectedTeamToManage) return;
    if (!confirm('¿Deseas desvincular a este estudiante del equipo?')) return;
    try {
      await api.removeTeamMember(selectedTeamToManage.id, studentId);
      const updatedTeams = await api.getTeams();
      setTeams(updatedTeams.teams || []);
      const refreshedTeam = (updatedTeams.teams || []).find((t) => t.id === selectedTeamToManage.id);
      setSelectedTeamToManage(refreshedTeam || null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al remover estudiante del equipo');
    }
  };

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
      if (selectedTeamToManage?.id === teamId) {
        setSelectedTeamToManage(null);
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
      const teamObj = teams.find((t) => t.id === selectedTeamFilter);
      const memberIds = (teamObj?.members || []).map((m) => m.id);
      const athleteId = sub.user?.id || sub.userId;
      const isMember = memberIds.includes(athleteId) || sub.user?.teamId === selectedTeamFilter || sub.user?.team?.id === selectedTeamFilter;
      if (!isMember) return false;
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
  const teamMemberIds = (selectedTeamObj?.members || []).map((m) => m.id);
  const teamSubmissions = selectedTeamFilter
    ? submissions.filter((s) => {
        const uid = s.user?.id || s.userId;
        return teamMemberIds.includes(uid) || s.user?.teamId === selectedTeamFilter || s.user?.team?.id === selectedTeamFilter;
      })
    : [];
  const teamMembers = selectedTeamObj?.members || [];

  const totalTeamEvaluations = teamSubmissions.length;
  const avgTeamScore = totalTeamEvaluations > 0
    ? Math.round(teamSubmissions.reduce((acc, s) => acc + s.percentage, 0) / totalTeamEvaluations)
    : 0;

  const has4Tier = teamSubmissions.some((s) =>
    ['EXCELENTE', 'BUENO', 'REGULAR', 'MALO'].includes(s.performanceLevel || '')
  );

  let teamOverallLevel: PerformanceLevel = 'PRINCIPIANTE';
  if (has4Tier) {
    if (avgTeamScore >= 75) teamOverallLevel = 'EXCELENTE';
    else if (avgTeamScore >= 50) teamOverallLevel = 'BUENO';
    else if (avgTeamScore >= 25) teamOverallLevel = 'REGULAR';
    else teamOverallLevel = 'MALO';
  } else {
    if (avgTeamScore >= 85) teamOverallLevel = 'PROFESIONAL';
    else if (avgTeamScore >= 60) teamOverallLevel = 'COMPETENTE';
  }

  const teamLevelCounts = {
    excelente: teamSubmissions.filter((s) => s.performanceLevel === 'EXCELENTE').length,
    bueno: teamSubmissions.filter((s) => s.performanceLevel === 'BUENO').length,
    regular: teamSubmissions.filter((s) => s.performanceLevel === 'REGULAR').length,
    malo: teamSubmissions.filter((s) => s.performanceLevel === 'MALO').length,
    profesional: teamSubmissions.filter((s) => s.performanceLevel === 'PROFESIONAL').length,
    competente: teamSubmissions.filter((s) => s.performanceLevel === 'COMPETENTE').length,
    principiante: teamSubmissions.filter((s) => s.performanceLevel === 'PRINCIPIANTE').length,
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
          onClick={handleOpenTeamModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white text-rose-900 hover:bg-rose-100 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 self-start md:self-auto"
        >
          <Users className="w-4 h-4 text-rose-700" />
          <span>Gestionar / Crear Equipos</span>
        </button>
      </div>

      {/* Filter Bar with Team Search & Select */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/15 shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Search by athlete, test, or team name */}
        <div className="relative sm:col-span-2">
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

        {/* Level Filter */}
        <div>
          <select
            value={selectedLevelFilter}
            onChange={(e) => setSelectedLevelFilter(e.target.value)}
            className="w-full px-3.5 py-2 rounded-2xl bg-black/40 border border-white/15 text-white text-xs font-semibold"
          >
            <option value="">Todos los Niveles</option>
            <option value="EXCELENTE">Excelente (≥75%)</option>
            <option value="BUENO">Bueno (50-74%)</option>
            <option value="REGULAR">Regular (25-49%)</option>
            <option value="MALO">Malo (&lt;25%)</option>
            <option value="PROFESIONAL">Profesional</option>
            <option value="COMPETENTE">Competente</option>
            <option value="PRINCIPIANTE">Principiante</option>
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
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {has4Tier ? (
                  <>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {teamLevelCounts.excelente} Excelente
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {teamLevelCounts.bueno} Bueno
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {teamLevelCounts.regular} Regular
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {teamLevelCounts.malo} Malo
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {teamLevelCounts.profesional} Profesional
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {teamLevelCounts.competente} Competente
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {teamLevelCounts.principiante} Principiante
                    </span>
                  </>
                )}
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
                  Módulo de Auditoría & Grupos
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 flex items-center gap-2">
                  <Users className="w-6 h-6 text-rose-400" />
                  <span>{selectedTeamToManage ? `Gestionar Grupo: ${selectedTeamToManage.name}` : 'Crear y Administrar Grupos'}</span>
                </h2>
                <p className="text-xs text-stone-300 mt-1">
                  {selectedTeamToManage
                    ? 'Agrega cualquier estudiante existente o desvincula integrantes de este grupo deportivo.'
                    : 'Crea grupos de estudiantes para cada profesor y audita sus resultados y porcentajes por separado.'}
                </p>
              </div>

              <button
                onClick={() => setShowTeamModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedTeamToManage ? (
              /* DETALLE Y GESTIÓN DE INTEGRANTES DEL GRUPO */
              <div className="space-y-5">
                <button
                  type="button"
                  onClick={() => setSelectedTeamToManage(null)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>← Volver al listado de grupos</span>
                </button>

                {/* Formulario para agregar estudiante existente */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-3">
                  <h3 className="text-xs font-black uppercase text-rose-300 tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>Agregar Estudiante Existente al Grupo</span>
                  </h3>
                  <p className="text-[11px] text-stone-300">
                    Puedes agregar a cualquier estudiante ya registrado en la plataforma a este grupo:
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <select
                      value={selectedStudentToAdd}
                      onChange={(e) => setSelectedStudentToAdd(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-stone-900 border border-white/15 text-white text-xs font-semibold focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="">-- Seleccionar estudiante registrado --</option>
                      {availableStudents
                        .filter((st) => !selectedTeamToManage.members?.some((m) => m.id === st.id))
                        .map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.email})
                          </option>
                        ))}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddStudentToTeam}
                      disabled={!selectedStudentToAdd || addingStudent}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{addingStudent ? 'Agregando...' : 'Agregar al Grupo'}</span>
                    </button>
                  </div>
                </div>

                {/* Listado de integrantes actuales */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center justify-between">
                    <span>Integrantes Actuales ({selectedTeamToManage.members?.length || 0})</span>
                    <span className="text-[11px] text-stone-400 font-normal">
                      Creado por: {selectedTeamToManage.createdBy?.name || 'Profesor'}
                    </span>
                  </h3>

                  {(!selectedTeamToManage.members || selectedTeamToManage.members.length === 0) ? (
                    <div className="p-6 rounded-2xl bg-black/20 border border-white/10 text-center text-xs text-stone-400">
                      Este grupo aún no tiene estudiantes asignados. Selecciona uno en el buscador superior para agregarlo.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {selectedTeamToManage.members.map((member) => (
                        <div
                          key={member.id}
                          className="p-3 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between hover:bg-black/50 transition-all"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center justify-center font-bold text-xs">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{member.name}</h4>
                              <p className="text-[10px] text-stone-400">{member.email}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveStudentFromTeam(member.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Desvincular del grupo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* LISTADO DE GRUPOS Y CREACIÓN */
              <>
                {/* Formulario de Creación de Equipo */}
                <form onSubmit={handleCreateTeam} className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-3">
                  <h3 className="text-xs font-black uppercase text-rose-300 tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo Grupo de Estudiantes</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 block mb-1">
                        Nombre del Grupo *
                      </label>
                      <input
                        type="text"
                        required
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Ej. Grupo Táctico Prof. Fredy"
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
                        placeholder="Ej. Estudiantes K1 Tarde"
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
                      {creatingTeam ? 'Guardando...' : 'Crear Grupo'}
                    </button>
                  </div>
                </form>

                {/* Listado de Equipos Registrados */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase text-white tracking-wider">
                    Grupos Registrados ({teams.length})
                  </h3>

                  {teams.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No hay grupos registrados aún.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {teams.map((tm) => (
                        <div
                          key={tm.id}
                          className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-center justify-between hover:bg-black/50 transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{tm.name}</h4>
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40">
                                {tm.memberCount || 0} Integrantes
                              </span>
                              {tm.createdBy?.name && (
                                <span className="text-[9px] text-stone-400">
                                  (Prof. {tm.createdBy.name})
                                </span>
                              )}
                            </div>
                            {tm.description && (
                              <p className="text-[11px] text-stone-300 mt-0.5">{tm.description}</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleSelectTeamToManage(tm)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-stone-200 hover:text-white text-xs font-bold transition-all flex items-center space-x-1"
                              title="Gestionar estudiantes de este grupo"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Estudiantes</span>
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(tm.id, tm.name)}
                              disabled={deletingTeamId === tm.id}
                              className="p-2 rounded-xl hover:bg-rose-900/50 text-stone-400 hover:text-rose-300 transition-colors"
                              title="Eliminar grupo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

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
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs mb-2">
                      <span className="text-[10px] font-bold text-stone-400 block uppercase">
                        Opción seleccionada por el atleta:
                      </span>
                      <p className="font-semibold text-white mt-0.5">{choiceText}</p>
                      {(ans.selectedOption?.imageUrl || ans.imageUrl) && (
                        <div className="mt-2.5 rounded-xl overflow-hidden border border-white/20 bg-stone-950/80 max-w-sm">
                          <img
                            src={ans.selectedOption?.imageUrl || ans.imageUrl}
                            alt="Diagrama táctico seleccionado"
                            className="w-full h-auto max-h-52 object-contain p-2"
                          />
                        </div>
                      )}
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
