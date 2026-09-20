import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { VolleyballHeroBackground } from '../components/layout/VolleyballHeroBackground';
import { VolleyballLogo, VolleyballLoader } from '../components/ui/VolleyballLoader';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, googleAuth, quickLoginDemo, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    if (!credentialResponse.credential) {
      setError('No se recibió la credencial de Google.');
      return;
    }
    try {
      await googleAuth({ credential: credentialResponse.credential });
    } catch (err: any) {
      setError(err.message || 'Error al autenticar con Google');
    }
  };

  const handleDemoGoogle = async () => {
    setError(null);
    try {
      await googleAuth({
        demoUser: {
          email: 'atleta.google@universidad.edu',
          name: 'Atleta Google Universitario',
          picture: '/icons/icondefault.png',
        },
      });
    } catch (err: any) {
      setError(err.message || 'Error con Google');
    }
  };

  return (
    <VolleyballHeroBackground showAthletes={true}>
      <div className="min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-20 py-8 lg:py-12 max-w-7xl mx-auto">
        
        {/* Top Header / Branding */}
        <div className="flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <VolleyballLogo size={42} />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider text-white uppercase">
                Volleyball <span className="text-rose-300">Tactics</span>
              </span>
              <span className="text-[10px] tracking-widest text-rose-200 font-semibold uppercase">
                Plataforma Universitaria de Evaluación
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-3">
            <span className="text-xs text-rose-100">¿No tienes cuenta?</span>
            <button
              onClick={onSwitchToRegister}
              className="px-4 py-1.5 rounded-full border border-white/30 text-xs font-semibold text-white hover:bg-white/10 transition-all"
            >
              Registrarse
            </button>
          </div>
        </div>

        {/* Main Center Area with Form matching the Reference Design */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-8 z-20">
          
          {/* Left Column: Reference Login Box */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto lg:mx-0">
            
            {/* Static White Volleyball Ball & Academia Title */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-3 flex items-center justify-center">
                <img
                  src="/icons/fondoblanco.png"
                  alt="Balón de Voleibol"
                  className="w-20 h-20 object-contain drop-shadow-2xl select-none pointer-events-none"
                />
              </div>

              <h2 className="text-2xl font-black text-white tracking-wider text-center uppercase">
                Academia de <br />
                <span className="text-xl font-bold tracking-widest text-rose-100">Voleibol</span>
              </h2>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-black/40 border border-rose-400/50 flex items-center space-x-2 text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-rose-100 mb-1.5 ml-2">
                  Usuario o Correo Electrónico
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin o atleta@volleyball.edu"
                  className="w-full px-5 py-3 rounded-full bg-white text-stone-800 placeholder-stone-400 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 shadow-lg transition-all"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-rose-100 mb-1.5 ml-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-5 py-3 rounded-full bg-white text-stone-800 placeholder-stone-400 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-rose-400/40 shadow-lg transition-all"
                />
              </div>

              {/* Red Pill Submit Button: INICIAR SESIÓN */}
              <div className="pt-2 flex justify-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-52 py-2.5 px-6 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-sm tracking-widest uppercase shadow-xl hover:shadow-rose-600/50 transition-all border border-rose-400/30 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <span className="text-xs">Cargando...</span>
                  ) : (
                    <span>INICIAR SESIÓN</span>
                  )}
                </button>
              </div>

              {/* Forgot password */}
              <div className="text-center pt-1">
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Utiliza las cuentas demo preconfiguradas o inicia sesión con Google.');
                  }}
                  className="text-xs font-medium text-rose-200 hover:text-white underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="flex-shrink mx-4 text-[11px] font-semibold text-rose-200 tracking-wider uppercase">
                  o accede con
                </span>
                <div className="flex-grow border-t border-white/20"></div>
              </div>

              {/* Google OAuth Button */}
              <div className="w-full flex flex-col items-center justify-center space-y-2">
                <div className="w-full flex justify-center overflow-hidden rounded-full shadow-lg bg-white p-0.5">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('No se pudo conectar con el servicio de Google')}
                    shape="pill"
                    size="large"
                    width="360"
                    text="continue_with"
                    locale="es"
                  />
                </div>
              </div>

              {/* 1-Click Quick Demo Switcher (Instant Evaluation for Coach / Athlete) */}
              <div className="pt-3 rounded-2xl bg-black/25 p-3 border border-white/10">
                <p className="text-[11px] font-bold text-rose-200 uppercase tracking-wider mb-2 text-center">
                  Acceso Rápido de Prueba (1-Click)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => quickLoginDemo('ADMIN')}
                    className="py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>Entrenador / Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => quickLoginDemo('USER')}
                    className="py-1.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-rose-300" />
                    <span>Atleta / Usuario</span>
                  </button>
                </div>
              </div>

            </form>

            {/* Powered by UFPS Badge */}
            <div className="flex flex-col items-center justify-center mt-6 text-center">
              <div className="flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-black/40 border border-white/15 backdrop-blur-sm shadow-md">
                <span className="text-[11px] font-bold text-rose-100 tracking-wider uppercase">
                  Powered by
                </span>
                <img
                  src="/icons/ufps.png"
                  alt="UFPS Logo"
                  className="h-7 w-auto object-contain drop-shadow"
                />
              </div>
            </div>

          </div>

          {/* Right Column (Hero pitch summary for desktop) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center pl-8 text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-rose-200 font-bold text-xs uppercase tracking-widest w-fit mb-4 backdrop-blur-sm">
              Sistema de Entrenamiento Táctico
            </span>

            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tight leading-none mb-6">
              Decisiones en Cancha <br />
              <span className="text-rose-300">K1 y K2 en Tiempo Real</span>
            </h1>

            <p className="text-rose-100 text-sm xl:text-base leading-relaxed mb-8 max-w-lg">
              Plataforma para evaluar a atletas antes, durante y después del partido. Analiza comprensión de táctica ofensiva y defensiva, percepción visual del atacante rival y respuestas éticas situacionales.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="block text-xl font-black text-rose-300">K1 & K2</span>
                <span className="text-[11px] text-rose-100 font-medium">Fases de Juego</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="block text-xl font-black text-rose-300">Videos</span>
                <span className="text-[11px] text-rose-100 font-medium">Toma de Decisión</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <span className="block text-xl font-black text-rose-300">100%</span>
                <span className="text-[11px] text-rose-100 font-medium">Retroalimentación</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar for Mobile */}
        <div className="sm:hidden text-center z-20 pt-4">
          <button
            onClick={onSwitchToRegister}
            className="text-xs font-semibold text-rose-100 underline"
          >
            ¿No tienes cuenta? Regístrate aquí
          </button>
        </div>

      </div>
    </VolleyballHeroBackground>
  );
};
