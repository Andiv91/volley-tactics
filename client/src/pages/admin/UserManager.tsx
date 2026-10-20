import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, Team } from '../../types';
import { VolleyballLoader } from '../../components/ui/VolleyballLoader';
import {
  Users,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Tag,
} from 'lucide-react';

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'COACH' | 'ADMIN'>('ALL');

  // Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: 'USER' | 'COACH' | 'ADMIN';
    password: string;
    teamId: string;
  }>({
    name: '',
    email: '',
    role: 'USER',
    password: '',
    teamId: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, teamsRes] = await Promise.all([
        api.getAllUsers(),
        api.getTeams().catch(() => ({ teams: [] })),
      ]);
      setUsers(usersRes.users || []);
      setTeams(teamsRes.teams || []);
    } catch (err: any) {
      console.error('Error cargando usuarios:', err);
      setStatusMessage({ type: 'error', text: 'Error al cargar la lista de usuarios.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'USER',
      password: '',
      teamId: '',
    });
    setIsCreating(true);
  };

  const openEditModal = (user: User) => {
    setIsCreating(false);
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: (user.role as any) || 'USER',
      password: '', // Empty means do not update
      teamId: user.teamId || '',
    });
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Nombre y correo son requeridos.');
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    try {
      if (isCreating) {
        await api.createUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password || undefined,
          role: formData.role,
          teamId: formData.teamId || null,
        });
        setStatusMessage({ type: 'success', text: `Usuario "${formData.name}" creado con éxito.` });
      } else if (editingUser) {
        await api.updateUser(editingUser.id, {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password ? formData.password.trim() : undefined,
          role: formData.role,
          teamId: formData.teamId || null,
        });
        setStatusMessage({ type: 'success', text: `Usuario "${formData.name}" actualizado con éxito.` });
      }
      closeModal();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.email === 'admin') {
      alert('La cuenta principal de Administrador no se puede eliminar.');
      return;
    }
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar permanentemente al usuario "${user.name}" (${user.email})? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      await api.deleteUser(user.id);
      setStatusMessage({ type: 'success', text: `Usuario "${user.name}" eliminado correctamente.` });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar usuario.');
    }
  };

  // Metrics
  const totalCount = users.length;
  const studentsCount = users.filter((u) => u.role === 'USER').length;
  const coachesCount = users.filter((u) => u.role === 'COACH').length;
  const adminsCount = users.filter((u) => u.role === 'ADMIN').length;

  // Filtered List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.team?.name || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter === 'ALL') return true;
    return u.role === roleFilter;
  });

  if (loading) {
    return <VolleyballLoader text="Cargando directorio de usuarios del sistema..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Control Maestro del Sistema
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-rose-400" />
            <span>Gestión de Usuarios</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl">
            Panel exclusivo para la cuenta Administrador. Aquí puedes consultar a todos los usuarios, modificar sus roles (Estudiante, Técnico o Administrador), nombres, correos, equipos y contraseñas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Usuario</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-md shadow-lg">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
            Total Usuarios
          </span>
          <span className="text-3xl font-black text-white">{totalCount}</span>
        </div>

        <div className="p-5 rounded-3xl bg-blue-950/30 border border-blue-500/20 backdrop-blur-md shadow-lg">
          <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block mb-1">
            Estudiantes
          </span>
          <span className="text-3xl font-black text-blue-200">{studentsCount}</span>
        </div>

        <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/20 backdrop-blur-md shadow-lg">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
            Técnicos
          </span>
          <span className="text-3xl font-black text-amber-200">{coachesCount}</span>
        </div>

        <div className="p-5 rounded-3xl bg-rose-950/30 border border-rose-500/20 backdrop-blur-md shadow-lg">
          <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest block mb-1">
            Administradores
          </span>
          <span className="text-3xl font-black text-rose-200">{adminsCount}</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-black/40 border border-white/10">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o equipo..."
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-stone-900/80 border border-white/10 text-white text-xs placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              roleFilter === 'ALL'
                ? 'bg-white text-stone-950 shadow-md'
                : 'bg-white/10 text-stone-300 hover:bg-white/20'
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            onClick={() => setRoleFilter('USER')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              roleFilter === 'USER'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/50'
            }`}
          >
            Estudiantes ({studentsCount})
          </button>
          <button
            onClick={() => setRoleFilter('COACH')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              roleFilter === 'COACH'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50'
            }`}
          >
            Técnicos ({coachesCount})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              roleFilter === 'ADMIN'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50'
            }`}
          >
            Admins ({adminsCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-white/10 bg-black/40 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] font-black uppercase tracking-wider text-rose-200">
                <th className="py-4 px-6">Usuario</th>
                <th className="py-4 px-6">Correo</th>
                <th className="py-4 px-6">Rol Actual</th>
                <th className="py-4 px-6">Equipo</th>
                <th className="py-4 px-6">Registro</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-stone-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isMasterAdmin = u.email === 'admin';
                  const userRole = u.role || 'USER';

                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={u.avatarUrl || '/icons/icondefault.png'}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-white/20 bg-stone-900 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block text-sm">
                              {u.name}
                            </span>
                            {(u as any).googleId && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Cuenta vinculada a Google
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 font-mono text-stone-300">
                        {u.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        {userRole === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                            <span>Administrador</span>
                          </span>
                        ) : userRole === 'COACH' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>Técnico</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                            <span>Estudiante</span>
                          </span>
                        )}
                      </td>

                      {/* Team */}
                      <td className="py-4 px-6 text-stone-300">
                        {u.team?.name ? (
                          <span className="px-2.5 py-1 rounded-xl bg-white/10 text-[11px] font-bold text-white">
                            {u.team.name}
                          </span>
                        ) : (
                          <span className="text-stone-500 italic">Sin equipo</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-stone-400 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CO') : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition-colors"
                            title="Modificar usuario y rol"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {!isMasterAdmin && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create User Modal */}
      {(isCreating || editingUser) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-white/20 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-wide">
                  {isCreating ? 'Crear Nuevo Usuario' : 'Modificar Usuario'}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {isCreating
                    ? 'Registra manualmente un estudiante, técnico o administrador'
                    : `Editando los datos de ${editingUser?.name}`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Camila Ortiz"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-medium"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                  Usuario o Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="correo@ejemplo.com o admin"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-medium"
                  />
                </div>
              </div>

              {/* Role Selection (CRITICAL) */}
              <div>
                <label className="block text-xs font-bold text-rose-200 uppercase mb-2">
                  Rol del Usuario
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'USER' })}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      formData.role === 'USER'
                        ? 'bg-blue-600/30 border-blue-400 text-white shadow-lg ring-2 ring-blue-500/40'
                        : 'bg-stone-800/60 border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <span className="block text-xs font-black uppercase">Estudiante</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">Atleta evaluado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'COACH' })}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      formData.role === 'COACH'
                        ? 'bg-amber-600/30 border-amber-400 text-white shadow-lg ring-2 ring-amber-500/40'
                        : 'bg-stone-800/60 border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                    <span className="block text-xs font-black uppercase">Técnico</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">Crea tests y equipos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      formData.role === 'ADMIN'
                        ? 'bg-rose-600/30 border-rose-400 text-white shadow-lg ring-2 ring-rose-500/40'
                        : 'bg-stone-800/60 border-white/10 text-stone-400 hover:text-white'
                    }`}
                  >
                    <ShieldAlert className="w-5 h-5 mx-auto mb-1 text-rose-400" />
                    <span className="block text-xs font-black uppercase">Admin</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">Control de usuarios</span>
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                  {isCreating ? 'Contraseña Inicial' : 'Nueva Contraseña (Opcional)'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={
                      isCreating
                        ? 'Contraseña (por defecto User123!)'
                        : 'Dejar en blanco para conservar contraseña actual'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-medium"
                  />
                </div>
                {!isCreating && (
                  <span className="text-[10px] text-stone-400 block mt-1">
                    Ingresa un valor únicamente si deseas restablecerle la contraseña a este usuario.
                  </span>
                )}
              </div>

              {/* Team Assignment */}
              <div>
                <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                  Equipo Asignado
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <select
                    value={formData.teamId}
                    onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800 border border-white/15 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-medium appearance-none"
                  >
                    <option value="">Sin equipo asignado</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-900/40 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : isCreating ? 'Crear Usuario' : 'Guardar Cambios'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
