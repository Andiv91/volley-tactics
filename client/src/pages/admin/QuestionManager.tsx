import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Question, Category, Option } from '../../types';
import { VolleyballLoader } from '../../components/ui/VolleyballLoader';
import { MediaViewer } from '../../components/media/MediaViewer';
import {
  Plus,
  Trash2,
  HelpCircle,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  MessageSquareQuote,
  Sparkles,
  Layers,
} from 'lucide-react';

export const QuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Category inline modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#ef4444');

  // Form State for new Question
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO'>('INTERMEDIO');
  const [phase, setPhase] = useState<'TEORICO' | 'DECISION_VIDEO' | 'POST_PARTIDO'>('TEORICO');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Options with custom per-option feedback!
  const [options, setOptions] = useState<
    { text: string; isCorrect: boolean; feedbackMessage: string }[]
  >([
    {
      text: '',
      isCorrect: true,
      feedbackMessage: '¡Excelente decisión! Fundamentada en los principios tácticos.',
    },
    {
      text: '',
      isCorrect: false,
      feedbackMessage: 'Decisión subóptima. Recuerda analizar el contexto de la jugada.',
    },
  ]);

  const loadData = async () => {
    try {
      const [qRes, cRes] = await Promise.all([
        api.getQuestions(),
        api.getCategories(),
      ]);
      setQuestions(qRes.questions || []);
      setCategories(cRes.categories || []);
      if (cRes.categories?.length > 0 && !categoryId) {
        setCategoryId(cRes.categories[0].id);
      }
    } catch (err) {
      console.error('Error cargando preguntas y categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddOption = () => {
    if (options.length >= 5) return;
    setOptions([
      ...options,
      {
        text: '',
        isCorrect: false,
        feedbackMessage: 'Esta opción no es la más adecuada para la situación.',
      },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      alert('Se requieren al menos 2 opciones de respuesta.');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: string, value: any) => {
    const updated = [...options];
    if (field === 'isCorrect') {
      // set single correct or allow multiple
      updated.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      (updated[index] as any)[field] = value;
    }
    setOptions(updated);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await api.createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        color: newCatColor,
      });
      setCategories([...categories, res.category]);
      setCategoryId(res.category.id);
      setShowCategoryModal(false);
      setNewCatName('');
      setNewCatDesc('');
    } catch (err: any) {
      alert(err.message || 'Error creando categoría');
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId) {
      alert('Título y categoría son requeridos.');
      return;
    }

    const validOptions = options.filter((o) => o.text.trim() !== '');
    if (validOptions.length < 2) {
      alert('Debes ingresar el texto para al menos 2 opciones.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createQuestion({
        title: title.trim(),
        context: context.trim(),
        categoryId,
        difficulty,
        phase,
        imageUrl: imageUrl.trim() || null,
        videoUrl: videoUrl.trim() || null,
        options: validOptions,
      });

      // Reset form
      setTitle('');
      setContext('');
      setImageUrl('');
      setVideoUrl('');
      setShowCreateModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error al crear la pregunta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta pregunta?')) return;
    try {
      await api.deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar pregunta');
    }
  };

  if (loading) {
    return <VolleyballLoader text="Cargando banco de preguntas y tácticas..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-rose-300 uppercase tracking-widest">
            Gestor Táctico
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            Banco de Preguntas & Retroalimentación
          </h1>
          <p className="text-xs sm:text-sm text-rose-200 mt-1">
            Configura preguntas multimedia con videos de YouTube, diagramas y mensajes educativos específicos por opción.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/15"
          >
            + Nueva Categoría
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg transition-all"
          >
            + Crear Pregunta
          </button>
        </div>
      </div>

      {/* Categories Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-bold text-rose-200 uppercase tracking-wider mr-2">
          Categorías:
        </span>
        {categories.map((cat) => (
          <span
            key={cat.id}
            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center space-x-1.5"
            style={{ backgroundColor: cat.color || '#ef4444' }}
          >
            <span>{cat.name}</span>
            <span className="bg-black/30 px-1.5 py-0.2 rounded-full text-[10px]">
              {questions.filter((q) => q.categoryId === cat.id).length}
            </span>
          </span>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10">
            <HelpCircle className="w-12 h-12 text-rose-400 mx-auto mb-3 opacity-60" />
            <p className="text-stone-300 font-medium">No hay preguntas registradas en el banco.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className="p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl hover:border-white/30 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase"
                        style={{ backgroundColor: q.category?.color || '#ef4444' }}
                      >
                        {q.category?.name || 'Categoría'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-semibold text-rose-200">
                        {q.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] font-semibold text-rose-200">
                        {q.phase}
                      </span>
                      {q.videoUrl && (
                        <span className="flex items-center space-x-1 text-[10px] text-rose-300 font-bold bg-rose-950/60 px-2 py-0.5 rounded">
                          <Video className="w-3 h-3" />
                          <span>Video YouTube/MP4</span>
                        </span>
                      )}
                      {q.imageUrl && (
                        <span className="flex items-center space-x-1 text-[10px] text-rose-300 font-bold bg-rose-950/60 px-2 py-0.5 rounded">
                          <ImageIcon className="w-3 h-3" />
                          <span>Diagrama/Imagen</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white">{q.title}</h3>
                    {q.context && (
                      <p className="text-xs text-rose-100/80 italic bg-black/20 p-2.5 rounded-xl border border-white/5">
                        “{q.context}”
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded-full text-rose-300 hover:text-white hover:bg-rose-600/40 transition-colors self-end sm:self-start"
                    title="Eliminar pregunta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Options and their pedagogical feedback */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[11px] font-bold text-rose-200 uppercase tracking-wider">
                    Opciones configuradas y mensajes de respuesta:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={opt.id || oIdx}
                        className={`p-3 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          opt.isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/40'
                            : 'bg-black/20 border-white/10'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${
                              opt.isCorrect ? 'bg-emerald-500 text-black' : 'bg-white/20 text-white'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <div>
                            <p className="font-semibold text-white">{opt.text}</p>
                            <p className="text-[11px] text-stone-300 mt-0.5 flex items-center gap-1">
                              <MessageSquareQuote className="w-3 h-3 text-rose-400 flex-shrink-0" />
                              <span className="italic">{opt.feedbackMessage}</span>
                            </p>
                          </div>
                        </div>

                        {opt.isCorrect && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase flex-shrink-0">
                            Respuesta Correcta
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE QUESTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-stone-900 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  Crear Pregunta Táctica
                </h2>
                <p className="text-xs text-rose-200">
                  Agrega situación de juego, video/imagen y mensajes de retroalimentación
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-white text-sm font-bold"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              
              {/* Category, Difficulty, Phase */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                    Categoría / Tema
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-white/15 text-white text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                    Dificultad
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-white/15 text-white text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="PRINCIPIANTE">Principiante</option>
                    <option value="INTERMEDIO">Intermedio</option>
                    <option value="AVANZADO">Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                    Fase
                  </label>
                  <select
                    value={phase}
                    onChange={(e) => setPhase(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-800 border border-white/15 text-white text-xs font-medium focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="TEORICO">Teórico (Pre-partido)</option>
                    <option value="DECISION_VIDEO">Decisión con Video (Durante)</option>
                    <option value="POST_PARTIDO">Post-partido / Reflexión</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                  Enunciado / Pregunta
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. ¿Hacia qué zona debe dirigirse el bloqueo ante un pase separado?"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-800 border border-white/15 text-white text-sm focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              {/* Scenario Context */}
              <div>
                <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                  Contexto o Situación de Cancha (Opcional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Describe la jugada, marcador, o conducta en cancha previa a la decisión..."
                  className="w-full px-4 py-2 rounded-xl bg-stone-800 border border-white/15 text-white text-xs focus:ring-2 focus:ring-rose-500 h-16 resize-none"
                />
              </div>

              {/* Media URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                    URL de Video (YouTube o MP4)
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-800 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-200 uppercase mb-1">
                    URL de Imagen o Diagrama Táctico
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-800 border border-white/15 text-white text-xs"
                  />
                </div>
              </div>

              {/* OPTIONS BUILDER WITH CRITICAL PER-OPTION FEEDBACK */}
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-200 uppercase">
                    Opciones de Respuesta y Retroalimentación Pedagógica
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="text-xs font-bold text-rose-400 hover:text-white underline"
                  >
                    + Agregar otra opción
                  </button>
                </div>

                {options.map((opt, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={opt.isCorrect}
                          onChange={() => handleOptionChange(index, 'isCorrect', true)}
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-bold text-white">
                          Opción {String.fromCharCode(65 + index)}{' '}
                          {opt.isCorrect && (
                            <span className="text-emerald-400 text-[11px] font-black">
                              (CORRECTA)
                            </span>
                          )}
                        </span>
                      </div>

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="text-rose-400 hover:text-white"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      placeholder={`Texto de la opción ${String.fromCharCode(65 + index)}`}
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-800 border border-white/15 text-white text-xs"
                      required
                    />

                    {/* Crucial feedback message */}
                    <div>
                      <span className="block text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-0.5">
                        Mensaje explicativo si el usuario elige esta opción:
                      </span>
                      <textarea
                        value={opt.feedbackMessage}
                        onChange={(e) => handleOptionChange(index, 'feedbackMessage', e.target.value)}
                        placeholder="Explica qué consecuencias tácticas o de conducta tiene elegir esta opción..."
                        className="w-full px-3.5 py-1.5 rounded-xl bg-stone-800 border border-white/15 text-white text-xs h-14 resize-none"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider shadow-lg"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Pregunta'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-900 border border-white/20 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white uppercase mb-4">
              Nueva Categoría Táctica
            </h2>
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-bold uppercase mb-1">
                  Nombre del Tema / Dimensión
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ej. Toma de Decisiones en Transición K2"
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-white/15 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold uppercase mb-1">
                  Descripción
                </label>
                <textarea
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Descripción de la competencia deportiva evaluada..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-white/15 text-white h-16 resize-none"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold uppercase mb-1">
                  Color para Gráficos Circulares
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-stone-300 font-mono text-xs">{newCatColor}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-full bg-white/10 text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-rose-600 text-white font-bold"
                >
                  Crear Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
