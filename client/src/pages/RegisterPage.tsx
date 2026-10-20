import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { VolleyballHeroBackground } from '../components/layout/VolleyballHeroBackground';
import { VolleyballLogo } from '../components/ui/VolleyballLoader';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft, UserCheck, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  initialGoogleProfile?: {
    email: string;
    name: string;
    avatarUrl?: string;
    googleId?: string;
    credential?: string;
  } | null;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSwitchToLogin,
  initialGoogleProfile,
}) => {
  const { register, googleAuth, isLoading } = useAuth();
  const [name, setName] = useState(initialGoogleProfile?.name || '');
  const [email, setEmail] = useState(initialGoogleProfile?.email || '');
  const [password, setPassword] = useState('');
  // Selección por defecto requerida: ESTUDIANTE ('USER')
  const [role, setRole] = useState<UserRole>('USER');
  const [error, setError] = useState<string | null>(null);

  const isGoogleFlow = !!initialGoogleProfile?.credential;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isGoogleFlow) {
      if (!name.trim()) {
        setError('Por favor indica tu nombre completo.');
        return;
      }
      try {
        await googleAuth({
          credential: initialGoogleProfile.credential,
          mode: 'register',
          role,
          name: name.trim(),
        });
      } catch (err: any) {
        setError(err.message || 'Error al completar el registro con Google.');
      }
      return;
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
      });
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    if (!credentialResponse.credential) {
      setError('No se recibió la credencial de Google.');
      return;
    }
    try {
      await googleAuth({
        credential: credentialResponse.credential,
        mode: 'register',
        role,
      });
    } catch (err: any) {
      setError(err.message || 'Error al registrarse con Google');
    }
  };

  return (
    <VolleyballHeroBackground showAthletes={false}>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg bg-stone-900/90 backdrop-blur-2xl p-6 sm:p-9 rounded-3xl border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          
          <button
            onClick={onSwitchToLogin}
            className="flex items-center space-x-1.5 text-xs font-semibold text-rose-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio de sesión</span>
          </button>

          <div className="flex flex-col items-center mb-6 text-center">
            <VolleyballLogo size={46} />
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider mt-2.5">
              {isGoogleFlow ? 'Completa tu Registro' : 'Crear Cuenta'}
            </h2>
            <p className="text-xs text-rose-200 max-w-sm mt-1">
              {isGoogleFlow
                ? 'Confirma tus datos y selecciona tu rol para comenzar en Volleyball Tactics'
                : 'Únete a la plataforma universitaria de evaluación táctica'}
            </p>
          </div>

          {/* Banner de flujo con Google si aplica */}
          {isGoogleFlow && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center space-x-3 text-xs text-emerald-200">
              <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block">Vinculando cuenta de Google:</span>
                <span className="font-mono text-[11px] text-emerald-300">{initialGoogleProfile?.email}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex items-center space-x-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nombre */}
            <div>
              <label className="block text-xs font-bold text-rose-100 uppercase tracking-wider mb-1.5 ml-1">
                Nombre Completo o Posición
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Camila Ortiz (Punta Receptora)"
                required
                className="w-full px-5 py-3 rounded-2xl bg-white text-stone-800 placeholder-stone-400 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-rose-400/40 shadow-md"
              />
            </div>

            {/* Correo (solo editable si no viene de Google) */}
            {!isGoogleFlow && (
              <div>
                <label className="block text-xs font-bold text-rose-100 uppercase tracking-wider mb-1.5 ml-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="atleta@universidad.edu"
                  required
                  className="w-full px-5 py-3 rounded-2xl bg-white text-stone-800 placeholder-stone-400 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-rose-400/40 shadow-md"
                />
              </div>
            )}

            {/* Contraseña (solo si no viene de Google) */}
            {!isGoogleFlow && (
              <div>
                <label className="block text-xs font-bold text-rose-100 uppercase tracking-wider mb-1.5 ml-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-5 py-3 rounded-2xl bg-white text-stone-800 placeholder-stone-400 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-rose-400/40 shadow-md"
                />
              </div>
            )}

            {/* SELECCIÓN EXPLÍCITA DE ROL CON ÉNFASIS VISUAL */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-xs font-black text-rose-200 uppercase tracking-wider">
                  Selecciona tu Rol (Obligatorio)
                </label>
                <span className="text-[10px] text-stone-400 italic">
                  Toca una opción para elegir
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Opción 1: Estudiante (Seleccionada por defecto) */}
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    role === 'USER'
                      ? 'bg-blue-950/60 border-blue-400 ring-2 ring-blue-500 shadow-xl shadow-blue-950/50 scale-[1.01]'
                      : 'bg-black/30 border-white/10 hover:border-white/20 text-stone-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        role === 'USER' ? 'bg-blue-600 text-white' : 'bg-white/10 text-stone-400'
                      }`}>
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-black uppercase tracking-wide ${
                        role === 'USER' ? 'text-white' : 'text-stone-300'
                      }`}>
                        Estudiante
                      </span>
                    </div>

                    {role === 'USER' && (
                      <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    )}
                  </div>

                  <span className="inline-block px-2 py-0.5 mt-2 mb-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30 w-fit">
                    Seleccionado por defecto
                  </span>

                  <p className="text-[11px] text-stone-300 leading-snug">
                    Participa en evaluaciones tácticas K1/K2, revisa tu progreso y pertenece a tu equipo.
                  </p>
                </button>

                {/* Opción 2: Técnico */}
                <button
                  type="button"
                  onClick={() => setRole('COACH')}
                  className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                    role === 'COACH'
                      ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-500 shadow-xl shadow-amber-950/50 scale-[1.01]'
                      : 'bg-black/30 border-white/10 hover:border-white/20 text-stone-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        role === 'COACH' ? 'bg-amber-600 text-white' : 'bg-white/10 text-stone-400'
                      }`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className={`text-sm font-black uppercase tracking-wide ${
                        role === 'COACH' ? 'text-white' : 'text-stone-300'
                      }`}>
                        Técnico
                      </span>
                    </div>

                    {role === 'COACH' && (
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    )}
                  </div>

                  <span className="inline-block px-2 py-0.5 mt-2 mb-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 w-fit">
                    Entrenador / Evaluador
                  </span>

                  <p className="text-[11px] text-stone-300 leading-snug">
                    Diseña pruebas tácticas, organiza equipos de atletas, audita respuestas y revisa estadísticas.
                  </p>
                </button>

              </div>
            </div>

            {/* Botón de Enviar */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs sm:text-sm tracking-widest uppercase shadow-xl shadow-rose-900/50 hover:shadow-rose-600/50 transition-all border border-rose-400/30 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <span>Procesando...</span>
                ) : isGoogleFlow ? (
                  <span>FINALIZAR REGISTRO CON GOOGLE</span>
                ) : (
                  <span>CREAR CUENTA</span>
                )}
              </button>
            </div>

            {/* Separador y Google Sign-up si es registro normal */}
            {!isGoogleFlow && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/20"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-rose-200 tracking-wider uppercase">
                    o registrarse directamente con
                  </span>
                  <div className="flex-grow border-t border-white/20"></div>
                </div>

                <div className="w-full flex justify-center overflow-hidden rounded-full shadow-lg bg-white p-0.5">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('No se pudo conectar con el servicio de Google')}
                    shape="pill"
                    size="large"
                    width="340"
                    text="signup_with"
                    locale="es"
                  />
                </div>
              </>
            )}

          </form>

          <p className="text-center text-xs text-rose-200 mt-6">
            ¿Ya tienes cuenta?{' '}
            <button onClick={onSwitchToLogin} className="text-white font-bold underline">
              Inicia sesión aquí
            </button>
          </p>

        </div>
      </div>
    </VolleyballHeroBackground>
  );
};
