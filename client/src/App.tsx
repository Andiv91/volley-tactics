import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AthleteDashboard } from './pages/AthleteDashboard';
import { TestRunnerPage } from './pages/TestRunnerPage';
import { TestResultPage } from './pages/TestResultPage';
import { AthleteHistoryPage } from './pages/AthleteHistoryPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { QuestionManager } from './pages/admin/QuestionManager';
import { TestManager } from './pages/admin/TestManager';
import { ResultsExplorer } from './pages/admin/ResultsExplorer';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { Navbar } from './components/layout/Navbar';
import { VolleyballLoader } from './components/ui/VolleyballLoader';
import { VolleyballHeroBackground } from './components/layout/VolleyballHeroBackground';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary atrapó un error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#580b19] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-black/40 border border-white/20 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
            <h2 className="text-xl font-black uppercase tracking-wider mb-2 text-rose-300">
              Actualización detectada
            </h2>
            <p className="text-xs text-rose-100 mb-6">
              {this.state.error?.message || 'Se ha actualizado la plataforma. Haz clic abajo para recargar la versión más reciente.'}
            </p>
            <button
              onClick={() => {
                try {
                  if (typeof caches !== 'undefined') {
                    caches.keys().then((names) => {
                      names.forEach((n) => caches.delete(n));
                      window.location.reload();
                    });
                    return;
                  }
                } catch {}
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Recargar Plataforma
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('athlete-tests');
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<any | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  // Sincronizar inmediatamente la pestaña activa al iniciar sesión
  React.useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN' && !currentTab.startsWith('admin-')) {
        setCurrentTab('admin-dashboard');
      } else if (user.role === 'USER' && !currentTab.startsWith('athlete-')) {
        setCurrentTab('athlete-tests');
      }
    }
  }, [user?.role, user?.id]);

  // Asegurar pestaña por defecto en caso de cambio de rol
  const activeTabName = isAdmin
    ? (currentTab.startsWith('admin-') ? currentTab : 'admin-dashboard')
    : (currentTab.startsWith('athlete-') ? currentTab : 'athlete-tests');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#580b19]">
        <VolleyballLoader text="Iniciando plataforma deportiva..." />
      </div>
    );
  }

  // Si no ha iniciado sesión -> Mostrar Login o Registro
  if (!user) {
    if (authView === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7f1325] via-[#9e162f] to-[#4e0815] text-white flex flex-col">
      {/* Dynamic Red Court Background Patterns */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-16 left-6 w-32 h-64 bg-dot-matrix opacity-25" />
        <div className="absolute top-20 right-8 w-36 h-72 bg-dot-matrix-dense opacity-25" />
        <div className="absolute -bottom-10 right-0 w-[500px] h-[250px] opacity-40">
          <svg viewBox="0 0 600 300" fill="none" className="w-full h-full">
            <path
              d="M0,180 C150,90 250,260 420,170 C510,120 560,200 600,160 L600,300 L0,300 Z"
              fill="#e11d48"
            />
          </svg>
        </div>
      </div>

      {/* Global Navbar */}
      <Navbar
        currentTab={activeTabName}
        onTabChange={(tab) => {
          setActiveTestId(null);
          setCurrentTab(tab);
        }}
      />

      {/* Page Content */}
      <main className="relative z-10 flex-grow pb-16">
        {/* ATHLETE VIEWS */}
        {!isAdmin && (
          <>
            {activeTestId ? (
              <TestRunnerPage
                testId={activeTestId}
                onFinish={(submissionResult) => {
                  setActiveSubmission(submissionResult);
                  setActiveTestId(null);
                  setCurrentTab('athlete-result');
                }}
                onCancel={() => {
                  setActiveTestId(null);
                  setCurrentTab('athlete-tests');
                }}
              />
            ) : currentTab === 'athlete-result' && activeSubmission ? (
              <TestResultPage
                submission={activeSubmission}
                onBackToDashboard={() => {
                  setActiveSubmission(null);
                  setCurrentTab('athlete-tests');
                }}
                onRetry={() => {
                  if (activeSubmission.testId) {
                    setActiveTestId(activeSubmission.testId);
                    setActiveSubmission(null);
                  }
                }}
              />
            ) : currentTab === 'athlete-history' ? (
              <AthleteHistoryPage
                onInspectSubmission={(sub) => {
                  setActiveSubmission(sub);
                  setCurrentTab('athlete-result');
                }}
              />
            ) : (
              <AthleteDashboard
                onStartTest={(testId) => setActiveTestId(testId)}
                onViewHistory={() => setCurrentTab('athlete-history')}
              />
            )}
          </>
        )}

        {/* ADMIN VIEWS */}
        {isAdmin && (
          <>
            {activeTabName === 'admin-dashboard' && (
              <AdminDashboard
                onNavigate={(tab) => setCurrentTab(tab)}
                onInspectSubmission={(sub) => {
                  setActiveSubmission(sub);
                  setCurrentTab('admin-results');
                }}
              />
            )}

            {activeTabName === 'admin-questions' && <QuestionManager />}

            {activeTabName === 'admin-tests' && <TestManager />}

            {activeTabName === 'admin-results' && <ResultsExplorer />}

            {activeTabName === 'admin-analytics' && <AnalyticsPage />}
          </>
        )}
      </main>

      {/* Minimal Sports Footer */}
      <footer className="relative z-10 py-4 border-t border-white/10 text-center text-xs text-rose-200/70 bg-[#450713]/80">
        <p className="flex items-center justify-center space-x-2">
          <img
            src="/icons/fondoblanco.png"
            alt="Balón"
            className="w-4 h-4 object-contain"
          />
          <span>VoleiTactics © 2026 — Plataforma Universitaria de Evaluación Táctica y Toma de Decisiones</span>
        </p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};
