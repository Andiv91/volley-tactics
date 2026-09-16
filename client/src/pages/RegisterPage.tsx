import React, { useState } from 'react';
import { VolleyballHeroBackground } from '../components/layout/VolleyballHeroBackground';
import { VolleyballLogo } from '../components/ui/VolleyballLoader';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }
    try {
      await register({ name, email, password, role });
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    }
  };

  return (
    <VolleyballHeroBackground showAthletes={false}>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
          
          <button
            onClick={onSwitchToLogin}
            className="flex items-center space-x-1 text-xs text-rose-200 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio de sesión</span>
          </button>

          <div className="flex flex-col items-center mb-6">
            <VolleyballLogo size={48} />
            <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-2">
              Crear Cuenta
            </h2>
            <p className="text-xs text-rose-200">
              Únete a la plataforma táctica de voleibol
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-black/40 border border-rose-400/50 flex items-center space-x-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-rose-100 mb-1 ml-2">
                Nombre Completo o Posición
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Lucas Silva (Armador)"
                className="w-full px-5 py-2.5 rounded-full bg-white text-stone-800 placeholder-stone-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-rose-400/40 shadow-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-100 mb-1 ml-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atleta@universidad.edu"
                className="w-full px-5 py-2.5 rounded-full bg-white text-stone-800 placeholder-stone-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-rose-400/40 shadow-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-100 mb-1 ml-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-5 py-2.5 rounded-full bg-white text-stone-800 placeholder-stone-400 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-rose-400/40 shadow-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-100 mb-1 ml-2">
                Rol en el Equipo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`py-2 px-3 rounded-full text-xs font-bold transition-all border ${
                    role === 'USER'
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                      : 'bg-white/10 text-rose-200 border-white/20 hover:bg-white/20'
                  }`}
                >
                  Atleta / Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`py-2 px-3 rounded-full text-xs font-bold transition-all border ${
                    role === 'ADMIN'
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                      : 'bg-white/10 text-rose-200 border-white/20 hover:bg-white/20'
                  }`}
                >
                  Entrenador / Admin
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-sm tracking-widest uppercase shadow-xl transition-all"
              >
                {isLoading ? 'Registrando...' : 'CREAR CUENTA'}
              </button>
            </div>
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
