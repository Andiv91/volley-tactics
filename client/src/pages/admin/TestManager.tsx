import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { TestSummary, Question } from '../../types';
import { VolleyballLoader } from '../../components/ui/VolleyballLoader';
import {
  ClipboardList,
  Plus,
  Trash2,
  Clock,
  Award,
  Trophy,
  CheckSquare,
  Square,
  Flame,
  Edit3,
} from 'lucide-react';

export const TestManager: React.FC = () => {
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState('TEORICO');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingScore, setPassingScore] = useState(70);
  const [scaleType, setScaleType] = useState<'3_TIER' | '4_TIER'>('3_TIER');
  const [competentThreshold, setCompetentThreshold] = useState(60);
  const [professionalThreshold, setProfessionalThreshold] = useState(85);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const loadData = async () => {
    try {
      const [tRes, qRes] = await Promise.all([api.getTests(), api.getQuestions()]);
      setTests(tRes.tests || []);
      setQuestions(qRes.questions || []);
    } catch (err) {
      console.error('Error cargando evaluaciones y preguntas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingTestId(null);
    setTitle('');
    setDescription('');
    setPhase('TEORICO');
    setDurationMinutes(15);
    setPassingScore(70);
    setScaleType('3_TIER');
    setCompetentThreshold(60);
    setProfessionalThreshold(85);
    setSelectedQuestionIds([]);
    setShowCreateModal(true);
  };

  const handleOpenEdit = async (testSummary: TestSummary) => {
    try {
      const res = await api.getTestById(testSummary.id);
      const test = res.test;
      setEditingTestId(test.id);
      setTitle(test.title);
      setDescription(test.description || '');
      setPhase(test.phase || 'TEORICO');
      setDurationMinutes(test.durationMinutes || 15);
      setPassingScore(test.passingScore || 70);
      setScaleType(test.scaleType === '4_TIER' ? '4_TIER' : '3_TIER');
      setCompetentThreshold(test.competentThreshold ?? 60);
      setProfessionalThreshold(test.professionalThreshold ?? 85);
      setSelectedQuestionIds(test.questions.map((q) => q.id));
      setShowCreateModal(true);
    } catch (err: any) {
      alert(err.message || 'Error al cargar detalles de la evaluación');
    }
  };

  const toggleQuestionSelect = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      setSelectedQuestionIds(selectedQuestionIds.filter((qId) => qId !== id));
    } else {
      setSelectedQuestionIds([...selectedQuestionIds, id]);
    }
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('El título es requerido.');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      alert('Debes seleccionar al menos una pregunta para la evaluación.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTestId) {
        await api.updateTest(editingTestId, {
          title: title.trim(),
          description: description.trim(),
          phase,
          durationMinutes: Number(durationMinutes),
          passingScore: Number(passingScore),
          scaleType,
          competentThreshold: Number(competentThreshold),
          professionalThreshold: Number(professionalThreshold),
          questionIds: selectedQuestionIds,
        });
      } else {
        await api.createTest({
          title: title.trim(),
          description: description.trim(),
          phase,
          durationMinutes: Number(durationMinutes),
          passingScore: Number(passingScore),
          scaleType,
          competentThreshold: Number(competentThreshold),
          professionalThreshold: Number(professionalThreshold),
          questionIds: selectedQuestionIds,
        });
      }

      handleOpenCreate();
      setShowCreateModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar la evaluación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTest = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar esta evaluación?')) return;
    try {
      await api.deleteTest(id);
      setTests(tests.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar evaluación');
    }
  };

  if (loading) {
    return <VolleyballLoader text="Cargando evaluaciones técnicas..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">
            Gestión de Pruebas
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Evaluaciones y Baterías de Test
          </h1>
          <p className="text-xs sm:text-sm text-rose-200 mt-1">
            Organiza conjuntos de preguntas por fases de juego, límites de tiempo y puntajes mínimos de aprobación.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
        >
          + Crear Nueva Evaluación
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 p-6 shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase">
                  {test.phase}
                </span>
                <div className="flex items-center space-x-1 text-xs text-rose-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{test.durationMinutes} min</span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">{test.title}</h3>
              {test.description && (
                <p className="text-xs text-rose-100/80 mt-2 line-clamp-2">{test.description}</p>
              )}

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-stone-300">
                <span>{test.questionCount} preguntas incluidas</span>
                <span className="text-rose-300 font-bold">Mínimo: {test.passingScore}%</span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
                {test.scaleType === '4_TIER' ? (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold">
                      Escala Maestría (4 Niveles)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      Malo &lt;25%
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
                      Regular 25-49%
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      Bueno 50-74%
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      Excelente ≥75%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
                      Competente: ≥{test.competentThreshold ?? 60}%
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold">
                      Profesional: ≥{test.professionalThreshold ?? 85}%
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                {test.submissionCount} atletas evaluados
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleOpenEdit(test)}
                  className="px-2.5 py-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-1 text-xs font-bold"
                  title="Editar test"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDeleteTest(test.id)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-600/20 transition-all"
                  title="Eliminar test"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT TEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-stone-900 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                {editingTestId ? 'Editar Batería de Evaluación' : 'Crear Batería de Evaluación'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-white text-sm font-bold"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
              <div>
                <label className="block text-rose-200 font-bold uppercase mb-1">
                  Título de la Evaluación
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Evaluación de Principios Ofensivos K1"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-white/15 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-rose-200 font-bold uppercase mb-1">
                  Descripción / Instrucciones
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instrucciones para los atletas..."
                  className="w-full px-4 py-2 rounded-xl bg-stone-800 border border-white/15 text-white h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-rose-200 font-bold uppercase mb-1">
                    Fase Táctica
                  </label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-white/15 text-white"
                  >
                    <option value="TEORICO">Teórico (Pre-partido)</option>
                    <option value="DECISION_VIDEO">Decisión Video</option>
                    <option value="INTEGRAL">Integral / General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-rose-200 font-bold uppercase mb-1">
                    Tiempo Límite (Minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-white/15 text-white"
                  />
                </div>

                <div>
                  <label className="block text-rose-200 font-bold uppercase mb-1">
                    Puntaje Aprobatorio (%)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-white/15 text-white"
                  />
                </div>
              </div>

              {/* Performance Classification Scale Selector */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Criterio de Evaluación y Niveles de Clasificación</span>
                    </h3>
                    <p className="text-[11px] text-stone-300">
                      Selecciona el sistema de calificación por porcentaje de aciertos:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setScaleType('3_TIER')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      scaleType === '3_TIER'
                        ? 'bg-rose-950/60 border-rose-500 text-white shadow-md'
                        : 'bg-stone-800/60 border-white/10 text-stone-300 hover:border-white/30'
                    }`}
                  >
                    <span className="text-xs font-bold block">Escala Estándar (3 Niveles)</span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Principiante, Competente y Profesional con umbrales ajustables.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScaleType('4_TIER')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      scaleType === '4_TIER'
                        ? 'bg-rose-950/60 border-rose-500 text-white shadow-md'
                        : 'bg-stone-800/60 border-white/10 text-stone-300 hover:border-white/30'
                    }`}
                  >
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <span>Escala de Maestría (4 Niveles)</span>
                      <span className="px-1.5 py-0.5 bg-purple-500/30 text-purple-300 text-[9px] rounded font-black">Tesis</span>
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-0.5">
                      Malo, Regular, Bueno y Excelente (por cuartiles 25%).
                    </span>
                  </button>
                </div>

                {scaleType === '3_TIER' ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                      <div>
                        <label className="block text-emerald-300 font-bold uppercase text-[11px] mb-1">
                          Mínimo para "Competente" (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="98"
                            value={competentThreshold}
                            onChange={(e) => setCompetentThreshold(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-emerald-500/40 text-emerald-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            required
                          />
                          <span className="absolute right-3 top-2 text-stone-400 text-xs font-bold">%</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-amber-300 font-bold uppercase text-[11px] mb-1">
                          Mínimo para "Profesional" (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min={competentThreshold + 1}
                            max="100"
                            value={professionalThreshold}
                            onChange={(e) => setProfessionalThreshold(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-amber-500/40 text-amber-300 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            required
                          />
                          <span className="absolute right-3 top-2 text-stone-400 text-xs font-bold">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Live Scale Preview 3 tiers */}
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">
                        Escala de Clasificación Resultante:
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                        <div className="p-2 rounded-xl bg-orange-500/15 border border-orange-500/30">
                          <span className="font-bold text-orange-300 block">Principiante</span>
                          <span className="text-[10px] text-stone-300 font-mono">0% - {Math.max(0, competentThreshold - 1)}%</span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                          <span className="font-bold text-emerald-300 block">Competente</span>
                          <span className="text-[10px] text-stone-300 font-mono">{competentThreshold}% - {Math.max(competentThreshold, professionalThreshold - 1)}%</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
                          <span className="font-bold text-amber-300 block">Profesional</span>
                          <span className="text-[10px] text-stone-300 font-mono">≥ {professionalThreshold}%</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">
                      Escala Oficial de Maestría (4 Rangos):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30">
                        <span className="font-bold text-rose-300 block">Malo</span>
                        <span className="text-[10px] text-stone-300 font-mono">0% - 24%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30">
                        <span className="font-bold text-blue-300 block">Regular</span>
                        <span className="text-[10px] text-stone-300 font-mono">25% - 49%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                        <span className="font-bold text-emerald-300 block">Bueno</span>
                        <span className="text-[10px] text-stone-300 font-mono">50% - 74%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30">
                        <span className="font-bold text-amber-300 block">Excelente</span>
                        <span className="text-[10px] text-stone-300 font-mono">75% - 100%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Questions Selection Checklist */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-rose-200 font-bold uppercase">
                    Seleccionar Preguntas para esta Evaluación ({selectedQuestionIds.length} seleccionadas)
                  </label>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {questions.map((q) => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    return (
                      <div
                        key={q.id}
                        onClick={() => toggleQuestionSelect(q.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-rose-950/40 border-rose-500/60 text-white'
                            : 'bg-stone-800/60 border-white/10 text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-500" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-xs leading-snug">{q.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] text-rose-300 font-bold">
                              {q.category?.name || 'General'}
                            </span>
                            <span className="text-[10px] text-stone-400">• {q.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-full bg-white/10 text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-wider shadow-lg"
                >
                  {isSubmitting
                    ? 'Guardando...'
                    : editingTestId
                    ? 'Guardar Cambios de Evaluación'
                    : 'Crear Batería de Evaluación'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
