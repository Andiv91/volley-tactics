import React, { useState, useEffect, useRef } from 'react';
import { VolleyballLogo } from '../ui/VolleyballLoader';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList,
  BarChart3,
  HelpCircle,
  FileCheck2,
  LogOut,
  ShieldCheck,
  UserCheck,
  PieChart,
  Camera,
  Download,
  Menu,
  X,
  Users,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout, updateAvatar } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Escuchar evento de instalación PWA
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('Para instalar en tu celular: abre el menú del navegador (tres puntos o botón compartir) y selecciona "Agregar a pantalla principal" o "Instalar aplicación".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación estricta: máximo 1 MB (1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      alert('La imagen seleccionada pesa ' + (file.size / (1024 * 1024)).toFixed(2) + ' MB. El tamaño máximo permitido es 1 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    setUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          await updateAvatar(base64Data);
          alert('¡Foto de perfil actualizada con éxito!');
        } catch (err: any) {
          alert(err.message || 'Error al guardar la foto de perfil.');
        } finally {
          setUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      alert('No se pudo procesar la imagen seleccionada.');
      setUploadingAvatar(false);
    }
  };

  const userAvatarSrc = user?.avatarUrl && 
    user.avatarUrl !== '' && 
    !user.avatarUrl.includes('avatar-generic.svg') && 
    !user.avatarUrl.includes('unsplash.com') &&
    !user.avatarUrl.includes('dicebear') &&
    !user.avatarUrl.startsWith('data:image/png;base64,iVBOR')
    ? user.avatarUrl
    : '/icons/icondefault.png';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#640c1d]/95 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-16 sm:h-20">
          
          {/* Logo & Marca (Estático blanco, flex-shrink-0) */}
          <div
            onClick={() => onTabChange(isAdmin ? 'admin-dashboard' : 'athlete-tests')}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group select-none flex-shrink-0"
          >
            <VolleyballLogo size={38} spinning={false} className="flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white uppercase flex items-center gap-1.5 whitespace-nowrap">
                Volei<span className="text-rose-400">Tactics</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-rose-200 tracking-widest font-semibold uppercase whitespace-nowrap">
                Evaluación & Decisión UFPS
              </span>
            </div>
          </div>

          {/* Navegación para Escritorio */}
          <nav className="hidden lg:flex items-center space-x-1.5 xl:space-x-2 flex-shrink-0">
            {isAdmin ? (
              <>
                <button
                  onClick={() => onTabChange('admin-dashboard')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    currentTab === 'admin-dashboard'
                      ? 'bg-white text-rose-800 shadow-md'
                      : 'text-rose-100 hover:bg-white/10'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Resumen</span>
                </button>

                <button
                  onClick={() => onTabChange('admin-questions')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    currentTab === 'admin-questions'
                      ? 'bg-white text-rose-800 shadow-md'
                      : 'text-rose-100 hover:bg-white/10'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Preguntas</span>
                </button>

                <button
                  onClick={() => onTabChange('admin-tests')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    currentTab === 'admin-tests'
                      ? 'bg-white text-rose-800 shadow-md'
                      : 'text-rose-100 hover:bg-white/10'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Evaluaciones</span>
                </button>

                <button
                  onClick={() => onTabChange('admin-results')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    currentTab === 'admin-results'
                      ? 'bg-white text-rose-800 shadow-md'
                      : 'text-rose-100 hover:bg-white/10'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Auditoría</span>
                </button>

                <button
                  onClick={() => onTabChange('admin-analytics')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    currentTab === 'admin-analytics'
                      ? 'bg-white text-rose-800 shadow-md'
                      : 'text-rose-100 hover:bg-white/10'
                  }`}
                >
                  <PieChart className="w-3.5 h-3.5" />
                  <span>Gráficos</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onTabChange('athlete-tests')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    currentTab === 'athlete-tests'
                      ? 'bg-white text-rose-800 shadow-md'
                      : 'text-rose-100 hover:bg-white/10'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Evaluaciones</span>
                </button>

                <button
                  onClick={() => onTabChange('athlete-history')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    currentTab === 'athlete-history'
                      ? 'bg-white text-rose-800 shadow-md'
                      : 'text-rose-100 hover:bg-white/10'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Mis Resultados</span>
                </button>

                <button
                  onClick={() => onTabChange('athlete-team')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    currentTab === 'athlete-team'
                      ? 'bg-white text-rose-800 shadow-md'
                      : 'text-rose-100 hover:bg-white/10'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Equipo</span>
                </button>
              </>
            )}
          </nav>

          {/* Zona de Perfil y Botones de Acción */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Tarjeta de Usuario Unificada y Compacta */}
            <div className="flex items-center space-x-2.5 bg-black/30 py-1.5 px-3 rounded-2xl border border-white/10 flex-shrink-0">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-extrabold text-white leading-tight truncate max-w-[120px] xl:max-w-[160px]">
                  {user?.name || 'Usuario'}
                </span>
                <span className="text-[10px] font-semibold text-amber-300 flex items-center justify-end gap-1 mt-0.5">
                  {isAdmin ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-amber-300 flex-shrink-0" />
                      <span>Administrador</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3 h-3 text-rose-300 flex-shrink-0" />
                      <span>Atleta</span>
                    </>
                  )}
                </span>
              </div>

              {/* Avatar con botón de subida de foto y flex-shrink-0 */}
              <div className="relative group w-9 h-9 min-w-[36px] min-h-[36px] flex-shrink-0">
                <img
                  src={userAvatarSrc}
                  alt={user?.name || 'Foto de perfil'}
                  className="w-9 h-9 min-w-[36px] min-h-[36px] aspect-square rounded-full border-2 border-white/40 object-cover shadow-sm bg-stone-900 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icons/icondefault.png';
                  }}
                />

                {/* Botón flotante para subir foto */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-transform group-hover:scale-110"
                  title="Cambiar foto de perfil (máx. 1 MB)"
                  disabled={uploadingAvatar}
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Botón Instalar / Descargar App (PWA) - Ubicado a la derecha */}
            <button
              onClick={handleInstallPWA}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-rose-700/80 hover:bg-rose-600 text-[11px] font-bold text-white border border-rose-400/40 shadow-sm transition-all flex-shrink-0"
              title="Instalar aplicación en tu pantalla principal"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>

            {/* Botón Salir */}
            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="p-1.5 rounded-full text-rose-200 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Botón de Menú Móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Desplegable Responsivo para Móviles */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#520917] border-t border-white/10 px-4 py-3 space-y-2 animate-fadeIn">
          {isAdmin ? (
            <>
              <button
                onClick={() => {
                  onTabChange('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  currentTab === 'admin-dashboard' ? 'bg-white text-rose-800' : 'text-rose-100'
                }`}
              >
                Resumen General
              </button>
              <button
                onClick={() => {
                  onTabChange('admin-questions');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  currentTab === 'admin-questions' ? 'bg-white text-rose-800' : 'text-rose-100'
                }`}
              >
                Preguntas & Medios
              </button>
              <button
                onClick={() => {
                  onTabChange('admin-tests');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  currentTab === 'admin-tests' ? 'bg-white text-rose-800' : 'text-rose-100'
                }`}
              >
                Evaluaciones
              </button>
              <button
                onClick={() => {
                  onTabChange('admin-results');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  currentTab === 'admin-results' ? 'bg-white text-rose-800' : 'text-rose-100'
                }`}
              >
                Auditoría de Respuestas
              </button>
              <button
                onClick={() => {
                  onTabChange('admin-analytics');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  currentTab === 'admin-analytics' ? 'bg-white text-rose-800' : 'text-rose-100'
                }`}
              >
                Gráficos Circulares
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onTabChange('athlete-tests');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  currentTab === 'athlete-tests' ? 'bg-white text-rose-800' : 'text-rose-100'
                }`}
              >
                Evaluaciones Activas
              </button>
              <button
                onClick={() => {
                  onTabChange('athlete-history');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  currentTab === 'athlete-history' ? 'bg-white text-rose-800' : 'text-rose-100'
                }`}
              >
                Mis Resultados y Gráfico
              </button>
              <button
                onClick={() => {
                  onTabChange('athlete-team');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold ${
                  currentTab === 'athlete-team' ? 'bg-white text-rose-800' : 'text-rose-100'
                }`}
              >
                Mi Equipo y Compañeros
              </button>
            </>
          )}

          <div className="pt-2 border-t border-white/10">
            <button
              onClick={handleInstallPWA}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
            >
              <Download className="w-4 h-4" />
              <span>Instalar en Pantalla de Inicio</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
