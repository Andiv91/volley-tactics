import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Video,
  Copy,
  Check,
  Printer,
  Download,
  BookOpen,
  Sparkles,
  Info,
  Calendar,
  Clock,
  Target,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export const TacticalSessionFormatPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'session' | 'video' | 'sample'>('session');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const sessionPlainText = `========================================================================
UNIVERSIDAD FRANCISCO DE PAULA SANTANDER (UFPS)
MAESTRÍA EN PEDAGOGÍA Y ENTRENAMIENTO DEPORTIVO
FORMATO METODOLÓGICO DE SESIÓN DE ENTRENAMIENTO TÁCTICO
========================================================================

I. INFORMACIÓN GENERAL:
- Institución: Universidad Francisco de Paula Santander
- Programa de Investigación: Intervención Táctica en Toma de Decisiones en Voleibol
- Microciclo Nº: ____ | Sesión Nº: ____ | Fecha: ___ / ___ / 2026
- Escenario Deportivo: Cancha de Voleibol Universitario
- Horario: ________ a ________ | Duración Total: 90 - 120 minutos
- Tiempo del Bloque Táctico Específico: 35 a 40 minutos
- Entrenador Principal: ____________________________________
- Investigador / Evaluador Táctico: ___________________________
- Categoría / Rama: Universitaria / Formativa - Rama: [  ] Masc  [  ] Fem

II. OBJETIVO TÁCTICO DE LA SESIÓN:
- Fase de Juego a Intervenir:
  [  ] Fase K1 (Complejo 1: Recepción del Saque -> Colocación -> Ataque y Cobertura)
  [  ] Fase K2 (Complejo 2: Saque -> Bloqueo -> Defensa -> Colocación de Contraataque -> Ataque)
- Nivel de Complejidad Pedagógica:
  [  ] Situación de Baja Complejidad (Sin oposición o con bloqueo estático prefijado)
  [  ] Situación de Mediana Complejidad (Oposición activa semicontrolada, lectura de atacante/bloqueo)
  [  ] Situación de Alta Complejidad (Juego condicionado a puntuación táctica y estrés de decisión real)
- Situación Específica a Desarrollar:
  "Desarrollar la percepción visual anticipatoria y la velocidad de toma de decisión ante el sistema defensivo rival, optimizando la distribución del armado y la cobertura del remate."

III. ESTRUCTURA Y DESGLOSE METODOLÓGICO DE LA SESIÓN:

1. PARTE INICIAL / ACTIVACIÓN (15 - 20 minutos):
   * Calentamiento preventivo articular y muscular (prevención de lesiones en hombros, rodillas y tobillos).
   * Activación perceptivo-motriz: Desplazamientos cortos con estímulo visual y reacción ante trayectorias del balón.
   * Conexión cognitiva: Breve recordatorio de la situación táctica evaluada en el test digital de la plataforma.

2. PARTE PRINCIPAL - PROGRAMA TÁCTICO DE INTERVENCIÓN (35 - 40 minutos):
   * TAREA 1: Situación de Baja Complejidad (10 min)
     - Organización: Balón libre desde Z1/Z6 rival. Recepción dirigida hacia Z2-3.
     - Foco táctico: Lectura del colocador de la postura corporal de los bloqueadores sin salto defensivo rival.
     - Indicador pedagógico: Decisión de pase hacia la zona desprotegida (Z4, Z2 o Z3).
   
   * TAREA 2: Situación de Mediana Complejidad (15 min)
     - Organización: Saque rival controlado hacia zonas de conflicto (entre receptores).
     - Foco táctico: Recepción bajo presión con colocación obligada ante bloqueo doble móvil rival.
     - Indicador pedagógico: Eficacia en la selección del atacante favorable y armado de primer o segundo tiempo.

   * TAREA 3: Situación de Alta Complejidad (15 min)
     - Organización: Situación real de juego 6 vs 6 condicionado.
     - Regla especial: Se otorgan 2 puntos adicionales por cada ataque resuelto que haya superado el bloqueo rival mediante lectura anticipada previa, o por cobertura efectiva de zaguero ante bloqueo amortiguado.
     - Foco táctico: Toma de decisiones en transiciones rápidas K1 -> K2 con fatiga acumulada.

3. PARTE FINAL / VUELTA A LA CALMA & DEBRIEFING COGNITIVO (10 - 15 minutos):
   * Ejercicios regenerativos y estiramientos pasivos guiados.
   * Cierre Cognitivo (Debriefing): Ronda de preguntas rápidas con los atletas:
     - "¿Qué señal visual utilizaste para decidir si armar rápido al centro o zaguero?"
     - "¿Qué debió observar el bloqueador antes del contacto del colocador rival?"
   * Asignación de revisión en la plataforma web para contrastar con los porcentajes de conocimiento táctico.

IV. MATERIALES Y RECURSOS DIDÁCTICOS:
- 15 a 20 balones de voleibol reglamentarios.
- Conos de delimitación táctica en cancha.
- 1 Cámara de video fija (trípode posterior para grabación táctica en altura).
- 1 Dispositivo móvil / Tablet para registro observacional.

V. OBSERVACIONES GENERALES Y REGISTRO DE MEJORA:
________________________________________________________________________
________________________________________________________________________`;

  const videoPlainText = `========================================================================
UNIVERSIDAD FRANCISCO DE PAULA SANTANDER (UFPS)
FICHA TÉCNICA DE REGISTRO Y OBSERVACIÓN EN VIDEO DE SESIONES DE ENTRENAMIENTO
========================================================================

I. DATOS DEL REGISTRO AUDIOVISUAL:
- Código de Video / Archivo: VID-SESION-______
- Fecha de Grabación: ___ / ___ / 2026 | Hora: ________
- Escenario: ___________________________________________
- Foco de Grabación: [  ] Fase K1   [  ] Fase K2   [  ] Transición K1 <-> K2
- Configuración de Cámaras:
  * Cámara 1 (Principal): Vista Posterior Z1/Z6 elevada a 2.5m (Análisis de colocación, ángulos y recepción).
  * Cámara 2 (Secundaria): Vista Lateral Centro de Cancha (Análisis de altura de bloqueo, carrera de ataque y coberturas).

II. CUADRÍCULA DE ANÁLISIS DE SITUACIONES GRABADAS:

| Min:Seg | Sujeto Evaluado | Situación de Juego y Complejidad | Decisión Observada en Video | Criterio (Correcta / Subóptima / Error) | Causa Perceptivo-Táctica Detectada | Tarea Correctiva para la Siguiente Sesión |
|---------|-----------------|----------------------------------|------------------------------|-----------------------------------------|-----------------------------------|------------------------------------------|
| 08:42   | Sujeto 1 (Armador)| Mediana Complejidad: Bloqueo doble cerrado en Z4 | Armó balón alto a Z4 forzado | Subóptima                               | Fijación tardía en el central rival | Práctica de balón rápido a Z3 con finta |
| 14:15   | Sujeto 2 (Líbero) | Baja Complejidad: Saque flotante central | Dejó balón corto sin llamada | Error táctico                           | Falta de comunicación y dudas en Z6 | Asignación estricta de zonas de recepción |
| 22:30   | Sujeto 3 (Opuesto)| Alta Complejidad: Contraataque K2 tras bloqueo | Toque suave hacia zona desprotegida | Correcta                            | Excelente lectura de cobertura zaguera | Mantener variabilidad de golpeo |
| 31:05   | Sujeto 4 (Central)| Mediana Complejidad: Desplazamiento de bloqueo | Llegada a destiempo a banda | Error táctico                           | Miró el balón y no la carrera del atacante | Lectura visual de hombros del rematador |

III. CONCLUSIONES Y SÍNTESIS PARA LA TABULACIÓN DE LA MAESTRÍA:
- Total de Situaciones Observadas en la Sesión: _______
- Decisiones Correctas: _______ (_______%)
- Decisiones Subóptimas: _______ (_______%)
- Errores Críticos: _______ (_______%)
- Firma del Investigador: ____________________________`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950/90 via-stone-900/90 to-rose-950/90 rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl backdrop-blur-md relative overflow-hidden print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                Metodología de Maestría UFPS
              </span>
              <span className="text-xs text-rose-200">
                Fases K1 & K2 • Situaciones de Juego
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <FileSpreadsheet className="w-8 h-8 text-rose-400" />
              <span>Formatos de Entrenamiento Táctico & Registro de Video</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              Herramienta metodológica oficial requerida para estructurar las sesiones del <strong>Programa Táctico</strong> (30-40 minutos por sesión) y tabular las observaciones de las <strong>grabaciones de video</strong> para la tesis de maestría.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => copyToClipboard(activeTab === 'video' ? videoPlainText : sessionPlainText)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-white text-rose-900 hover:bg-stone-100 font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-rose-700" />}
              <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar Formato'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 pt-6 mt-6 border-t border-white/10">
          <button
            onClick={() => setActiveTab('session')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'session'
                ? 'bg-white text-stone-900 shadow-md ring-2 ring-rose-400'
                : 'bg-black/30 text-stone-300 hover:text-white hover:bg-black/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-rose-600" />
            <span>1. Formato de Sesión de Entrenamiento Táctico</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-white text-stone-900 shadow-md ring-2 ring-rose-400'
                : 'bg-black/30 text-stone-300 hover:text-white hover:bg-black/50'
            }`}
          >
            <Video className="w-4 h-4 text-rose-600" />
            <span>2. Formato de Registro & Observación en Video</span>
          </button>

          <button
            onClick={() => setActiveTab('sample')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'sample'
                ? 'bg-white text-stone-900 shadow-md ring-2 ring-rose-400'
                : 'bg-black/30 text-stone-300 hover:text-white hover:bg-black/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>3. Ejemplo Diligenciado para Enviar al Asesor</span>
          </button>
        </div>
      </div>

      {/* Notice Card for Advisor Alignment */}
      <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-200 print:hidden">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Indicación Metodológica para tu Trabajo de Grado:</strong>
          <span>
            Tal como te indicó tu asesor en el audio, no utilices los términos &quot;fácil&quot; o &quot;difícil&quot;. Utiliza siempre <strong>&quot;Situaciones de Juego de Baja Complejidad&quot;</strong>, <strong>&quot;Mediana Complejidad&quot;</strong> y <strong>&quot;Alta Complejidad&quot;</strong>. En cada sesión grabada, registra la decisión del atleta (ej. Sujeto 1, Sujeto 2) para poder contrastar los errores observados antes del programa contra los resultados finales en 2 meses.
          </span>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (PRINTABLE FORMAT) */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-10 border border-white/20 shadow-2xl space-y-8 font-sans print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">

        {/* Institutional Document Header */}
        <div className="flex items-center justify-between border-b-2 border-rose-600 pb-5">
          <div className="flex items-center space-x-4">
            <img
              src="/icons/ufps.png"
              alt="UFPS Logo"
              className="h-14 w-auto object-contain drop-shadow"
            />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase print:text-black">
                Universidad Francisco de Paula Santander
              </h2>
              <p className="text-xs text-rose-300 font-semibold uppercase tracking-wider print:text-stone-700">
                Maestría en Pedagogía y Entrenamiento Deportivo
              </p>
              <p className="text-[11px] text-stone-400 print:text-stone-600">
                Investigación: Intervención Táctica y Toma de Decisiones en Voleibol Universitario
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-[10px] font-black uppercase text-rose-200 print:border-stone-400 print:text-black">
              Instrumento Oficial Nº 01
            </span>
            <p className="text-[10px] text-stone-400 mt-1 print:text-stone-600">
              Evaluación Pre-Test y Post-Test
            </p>
          </div>
        </div>

        {/* TAB 1: FORMATO DE SESIÓN DE ENTRENAMIENTO */}
        {activeTab === 'session' && (
          <div className="space-y-6">
            <div className="text-center py-2">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white print:text-black">
                Formato de Sesión de Entrenamiento Táctico
              </h3>
              <p className="text-xs text-rose-300 font-medium uppercase tracking-wider print:text-stone-600">
                Programa de Intervención: Fases K1 (Complejo 1) y K2 (Complejo 2)
              </p>
            </div>

            {/* SECCIÓN I: IDENTIFICACIÓN GENERAL */}
            <div className="rounded-2xl border border-white/15 bg-black/30 p-4 sm:p-5 space-y-3 print:bg-stone-50 print:border-stone-300">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-400 border-b border-white/10 pb-1.5 print:text-rose-800">
                I. Información General y Planificación
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Microciclo:</span>
                  <span className="font-semibold text-white print:text-black">Nº _____</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Sesión Nº:</span>
                  <span className="font-semibold text-white print:text-black">_____ de 24</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Fecha:</span>
                  <span className="font-semibold text-white print:text-black">____ / ____ / 2026</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Duración Total:</span>
                  <span className="font-semibold text-white print:text-black">90 a 120 min</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Entrenador Principal:</span>
                  <span className="font-semibold text-white print:text-black">___________________________</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Investigador / Evaluador:</span>
                  <span className="font-semibold text-white print:text-black">Prof. Universitario (Maestría)</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Tiempo Bloque Táctico Específico:</span>
                  <span className="font-black text-rose-300 print:text-rose-700">35 a 40 minutos (Programa de Tesis)</span>
                </div>
                <div className="col-span-2">
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Población / Escuadra:</span>
                  <span className="font-semibold text-white print:text-black">Atletas Voleibol Universitario</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN II: OBJETIVOS PEDAGÓGICOS & COMPLEJIDAD */}
            <div className="rounded-2xl border border-white/15 bg-black/30 p-4 sm:p-5 space-y-4 print:bg-stone-50 print:border-stone-300">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-400 border-b border-white/10 pb-1.5 print:text-rose-800">
                II. Objetivo Pedagógico & Nivel de Complejidad Táctica
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block font-bold text-[10px] uppercase mb-1">
                    Fase de Juego Principal:
                  </span>
                  <div className="space-y-1.5">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded text-rose-600" />
                      <span className="font-semibold">Fase K1 (Recepción, Armado, Ataque y Cobertura)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-rose-600" />
                      <span className="font-semibold">Fase K2 (Bloqueo, Defensa, Contraataque y Apoyo)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <span className="text-stone-400 block font-bold text-[10px] uppercase mb-1">
                    Taxonomía de Complejidad Pedagógica:
                  </span>
                  <div className="space-y-1.5">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-rose-600" />
                      <span className="font-bold text-emerald-400 print:text-emerald-700">Situación de Baja Complejidad</span>
                      <span className="text-[10px] text-stone-400">(Sin oposición / bloqueo estático)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded text-rose-600" />
                      <span className="font-bold text-amber-400 print:text-amber-700">Situación de Mediana Complejidad</span>
                      <span className="text-[10px] text-stone-400">(Oposición semicontrolada)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded text-rose-600" />
                      <span className="font-bold text-rose-400 print:text-rose-700">Situación de Alta Complejidad</span>
                      <span className="text-[10px] text-stone-400">(Juego real con estrés de tiempo)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-stone-400 block font-bold text-[10px] uppercase mb-1">
                  Descripción del Objetivo Táctico Específico:
                </span>
                <p className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs italic text-stone-200 print:bg-white print:border-stone-300 print:text-black">
                  &quot;Mejorar la capacidad de percepción visual anticipatoria de los armadores y atacantes, discriminando la posición del bloqueo doble rival en situaciones de K1 para seleccionar la opción ofensiva óptima con cobertura de zaguero organizada.&quot;
                </p>
              </div>
            </div>

            {/* SECCIÓN III: DESGLOSE METODOLÓGICO */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-400 border-b border-white/10 pb-1.5 print:text-rose-800">
                III. Fases de la Sesión de Entrenamiento
              </h4>

              {/* 1. PARTE INICIAL */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2 print:bg-stone-50 print:border-stone-300">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-white print:text-black uppercase">
                    1. Parte Inicial: Calentamiento Preventivo & Activación Perceptivo-Motriz
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-rose-300 font-mono text-[10px]">
                    15 a 20 min
                  </span>
                </div>
                <ul className="list-disc list-inside text-xs text-stone-300 space-y-1 print:text-black">
                  <li>Movilidad articular dinámica y protocolo de prevención de lesiones en manguito rotador y rodillas.</li>
                  <li>Juegos de reacción visual: Desplazamientos cortos con lectura periférica de balones y cambios de dirección.</li>
                  <li>Socialización del foco táctico de la sesión para activar la concentración cognitiva de los jugadores.</li>
                </ul>
              </div>

              {/* 2. PARTE PRINCIPAL: EL PROGRAMA TÁCTICO */}
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-3 print:bg-stone-100 print:border-stone-400">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-rose-300 print:text-rose-800 uppercase flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>2. Parte Principal: Programa Táctico Específico de Maestría</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px]">
                    35 a 40 min
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1 print:bg-white print:border-stone-300">
                    <span className="font-bold text-emerald-400 print:text-emerald-700 block uppercase">
                      Tarea 1 (Baja Complejidad - 10 min): Percepción y Salida Guiada
                    </span>
                    <p className="text-stone-300 print:text-black">
                      Balón libre lanzado desde fondo de cancha rival. Recepción dirigida hacia Z2-3. El armador identifica la posición de 2 bloqueadores estáticos y asiste con balón rápido hacia la zona descubierta.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1 print:bg-white print:border-stone-300">
                    <span className="font-bold text-amber-400 print:text-amber-700 block uppercase">
                      Tarea 2 (Mediana Complejidad - 15 min): Situación Simulada con Oposición Semicontrolada
                    </span>
                    <p className="text-stone-300 print:text-black">
                      Saque rival dirigido a zona de conflicto entre Z5 y Z6. Se exige pase alto de emergencia y el armador decide distribución contra bloqueo doble activo móvil. Los zagueros estructuran sistema de cobertura 2-1-2-1 o 1-2-1-2.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1 print:bg-white print:border-stone-300">
                    <span className="font-bold text-rose-400 print:text-rose-700 block uppercase">
                      Tarea 3 (Alta Complejidad - 15 min): Juego Condicionado a Toma de Decisión
                    </span>
                    <p className="text-stone-300 print:text-black">
                      Situación de 6 vs 6 con marcador adverso (21-23). Cada ataque exitoso tras lectura anticipada del bloqueo rival o cobertura rescatada otorga 2 puntos tácticos directos.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. PARTE FINAL */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2 print:bg-stone-50 print:border-stone-300">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-white print:text-black uppercase">
                    3. Parte Final: Vuelta a la Calma & Debriefing Cognitivo
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-rose-300 font-mono text-[10px]">
                    10 a 15 min
                  </span>
                </div>
                <ul className="list-disc list-inside text-xs text-stone-300 space-y-1 print:text-black">
                  <li>Estiramiento muscular pasivo asistido y respiración recuperativa.</li>
                  <li>Ronda de preguntas y retroalimentación cognitiva: ¿Por qué elegiste rematar cruzado ante bloqueo cerrado? ¿En qué momento leyó el líbero la trayectoria del rematador?</li>
                  <li>Indicación de resolver la prueba táctica en la plataforma digital para contrastar con las decisiones de campo.</li>
                </ul>
              </div>
            </div>

            {/* FIRMAS */}
            <div className="pt-8 border-t border-white/15 grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-1">
                <div className="border-b border-stone-500 w-48 mx-auto mb-2" />
                <span className="font-bold text-white block print:text-black">Firma del Director Técnico</span>
                <span className="text-[10px] text-stone-400 print:text-stone-600">Entrenador Titular de la Escuadra</span>
              </div>
              <div className="space-y-1">
                <div className="border-b border-stone-500 w-48 mx-auto mb-2" />
                <span className="font-bold text-white block print:text-black">Firma del Investigador</span>
                <span className="text-[10px] text-stone-400 print:text-stone-600">Candidato a Magíster UFPS</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FICHA DE OBSERVACIÓN EN VIDEO */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="text-center py-2">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white print:text-black">
                Ficha Técnica de Registro y Observación en Video
              </h3>
              <p className="text-xs text-rose-300 font-medium uppercase tracking-wider print:text-stone-600">
                Tabulación Audiovisual de Situaciones de Juego y Errores Tácticos Recurrentes
              </p>
            </div>

            {/* METADATOS DEL VIDEO */}
            <div className="rounded-2xl border border-white/15 bg-black/30 p-4 sm:p-5 space-y-3 print:bg-stone-50 print:border-stone-300">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-400 border-b border-white/10 pb-1.5 print:text-rose-800">
                I. Configuración Técnica de la Grabación
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Código de Archivo:</span>
                  <span className="font-semibold text-white print:text-black">VID-2026-SESION-01</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Lugar de Grabación:</span>
                  <span className="font-semibold text-white print:text-black">Pamplona / Cúcuta</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Foco de Observación:</span>
                  <span className="font-semibold text-white print:text-black">Fase K1 & Transiciones</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-bold text-[10px] uppercase">Dispositivos:</span>
                  <span className="font-semibold text-white print:text-black">2 Cámaras (Posterior + Lateral)</span>
                </div>
              </div>
            </div>

            {/* TABLA DE OBSERVACIÓN */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-400 border-b border-white/10 pb-1.5 print:text-rose-800">
                II. Cuadrícula de Análisis Video-Táctico por Jugador
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-white/15 print:border-stone-400">
                <table className="w-full text-left text-xs text-stone-200 print:text-black">
                  <thead className="bg-black/50 text-[10px] uppercase tracking-wider font-bold text-rose-300 border-b border-white/10 print:bg-stone-200 print:text-black">
                    <tr>
                      <th className="p-3">Min:Seg</th>
                      <th className="p-3">Sujeto / Posición</th>
                      <th className="p-3">Complejidad de Situación</th>
                      <th className="p-3">Decisión Tomada en Video</th>
                      <th className="p-3">Valoración</th>
                      <th className="p-3">Causa Perceptiva / Error</th>
                      <th className="p-3">Tarea Correctiva</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-[11px] print:divide-stone-300">
                    <tr className="hover:bg-white/5">
                      <td className="p-3 font-mono font-bold text-rose-300 print:text-black">06:14</td>
                      <td className="p-3 font-bold">Sujeto 1 (Armador)</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                          Mediana Complejidad
                        </span>
                      </td>
                      <td className="p-3">Armado alto forzado a Z4 contra bloqueo doble</td>
                      <td className="p-3 text-rose-400 font-bold">Subóptima</td>
                      <td className="p-3 text-stone-300">Mirada fija en la pelota, no observó al central rival cerrado.</td>
                      <td className="p-3 text-stone-300">Pase rápido a Z3 o finta de zaguero Z1.</td>
                    </tr>

                    <tr className="hover:bg-white/5">
                      <td className="p-3 font-mono font-bold text-rose-300 print:text-black">12:35</td>
                      <td className="p-3 font-bold">Sujeto 2 (Líbero)</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                          Baja Complejidad
                        </span>
                      </td>
                      <td className="p-3">Duda en recepción de saque flotante central</td>
                      <td className="p-3 text-rose-400 font-bold">Error Táctico</td>
                      <td className="p-3 text-stone-300">Mala comunicación en la línea de conflicto con el punta Z5.</td>
                      <td className="p-3 text-stone-300">Demarcación y jerarquía de llamada vocal obligatoria.</td>
                    </tr>

                    <tr className="hover:bg-white/5">
                      <td className="p-3 font-mono font-bold text-rose-300 print:text-black">19:50</td>
                      <td className="p-3 font-bold">Sujeto 3 (Opuesto)</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                          Alta Complejidad
                        </span>
                      </td>
                      <td className="p-3">Toque colocado suave al espacio libre zaguero</td>
                      <td className="p-3 text-emerald-400 font-bold">Correcta</td>
                      <td className="p-3 text-stone-300">Lectura periférica del desplazamiento adelantado de la defensa.</td>
                      <td className="p-3 text-stone-300">Consolidar variabilidad de remate fuerte vs finta.</td>
                    </tr>

                    <tr className="hover:bg-white/5">
                      <td className="p-3 font-mono font-bold text-rose-300 print:text-black">27:08</td>
                      <td className="p-3 font-bold">Sujeto 4 (Central)</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                          Mediana Complejidad
                        </span>
                      </td>
                      <td className="p-3">Desplazamiento tardío de bloqueo hacia Z2</td>
                      <td className="p-3 text-rose-400 font-bold">Error Táctico</td>
                      <td className="p-3 text-stone-300">Saltó tarde por anticipar un balón que aún no salía de las manos.</td>
                      <td className="p-3 text-stone-300">Lectura de cadera y codo del colocador rival.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABULACIÓN ESTADÍSTICA */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 print:border-stone-300">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Situaciones Evaluadas</span>
                <span className="text-lg font-black text-white print:text-black mt-0.5 block">24 jugadas</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 print:border-stone-300">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Decisiones Correctas</span>
                <span className="text-lg font-black text-emerald-400 print:text-emerald-700 mt-0.5 block">14 (58.3%)</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 print:border-stone-300">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Decisiones Subóptimas</span>
                <span className="text-lg font-black text-amber-400 print:text-amber-700 mt-0.5 block">6 (25.0%)</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 print:border-stone-300">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Errores Críticos</span>
                <span className="text-lg font-black text-rose-400 print:text-rose-700 mt-0.5 block">4 (16.7%)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EJEMPLO COMPLETO PARA ENVIAR AL ASESOR */}
        {activeTab === 'sample' && (
          <div className="space-y-6">
            <div className="text-center py-2">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white print:text-black">
                Propuesta Metodológica para Presentar al Asesor de Tesis
              </h3>
              <p className="text-xs text-rose-300 font-medium uppercase tracking-wider print:text-stone-600">
                Texto estructurado con la terminología pedagógica oficial y justificación del programa táctico
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-white/15 text-xs text-stone-200 space-y-4 leading-relaxed font-mono print:bg-white print:border-stone-400 print:text-black">
              <p className="font-bold text-rose-300 uppercase print:text-rose-800">
                Estimado Asesor de Trabajo de Grado:
              </p>

              <p>
                Le presento la estructura formal del <strong>Formato de Sesión de Entrenamiento</strong> y la <strong>Ficha de Registro y Observación de Video</strong> diseñados para la intervención táctica de la maestría, atendiendo puntualmente a sus recomendaciones metodológicas:
              </p>

              <div className="space-y-2 pl-4 border-l-2 border-rose-500">
                <p>
                  <strong>1. Taxonomía de Complejidad Pedagógica:</strong> Se erradicó el uso de &quot;fácil&quot; o &quot;difícil&quot;. Todas las tareas y preguntas del sistema ahora se clasifican estrictamente en <em>Situaciones de Juego de Baja Complejidad</em>, <em>Situaciones de Mediana Complejidad</em> y <em>Situaciones de Alta Complejidad</em>.
                </p>
                <p>
                  <strong>2. Escala de Conocimiento Táctico (0 a 100%):</strong> El sistema digital arroja de forma inmediata el porcentaje exacto de conocimiento táctico de cada atleta y el consolidado por escuadra (ej. 70%, 80%, 90%), permitiendo la correlación directa entre el pre-test y post-test.
                </p>
                <p>
                  <strong>3. Programa Táctico en Cancha (35 a 40 minutos):</strong> La intervención se concentra en una franja táctica específica dentro de la sesión habitual del equipo, orientada a corregir las deficiencias detectadas en la grabación inicial del partido de Pamplona.
                </p>
                <p>
                  <strong>4. Registro en Video y Tabulación por Sujetos:</strong> Se implementó la ficha de observación donde se identifican a los atletas (Sujeto 1, Sujeto 2, etc.) registrando minuto, situación observada, decisión tomada y criterio de valoración para el seguimiento durante los 2 meses de intervención.
                </p>
              </div>

              <p className="text-stone-300 italic pt-2 print:text-black">
                Quedo atento a su visto bueno para continuar con la aplicación del instrumento y la primera sesión filmada.
              </p>
            </div>

            <div className="flex justify-end gap-3 print:hidden">
              <button
                onClick={() => copyToClipboard(`Estimado Asesor de Trabajo de Grado:\n\nLe presento la estructura formal del Formato de Sesión de Entrenamiento y la Ficha de Registro y Observación de Video diseñados para la intervención táctica de la maestría, atendiendo puntualmente a sus recomendaciones metodológicas:\n\n1. Taxonomía de Complejidad Pedagógica: Se erradicó el uso de "fácil" o "difícil". Todas las tareas y preguntas del sistema ahora se clasifican estrictamente en Situaciones de Juego de Baja Complejidad, Situaciones de Mediana Complejidad y Situaciones de Alta Complejidad.\n\n2. Escala de Conocimiento Táctico (0 a 100%): El sistema digital arroja de forma inmediata el porcentaje exacto de conocimiento táctico de cada atleta y el consolidado por escuadra (ej. 70%, 80%, 90%), permitiendo la correlación directa entre el pre-test y post-test.\n\n3. Programa Táctico en Cancha (35 a 40 minutos): La intervención se concentra en una franja táctica específica dentro de la sesión habitual del equipo, orientada a corregir las deficiencias detectadas en la grabación inicial del partido de Pamplona.\n\n4. Registro en Video y Tabulación por Sujetos: Se implementó la ficha de observación donde se identifican a los atletas (Sujeto 1, Sujeto 2, etc.) registrando minuto, situación observada, decisión tomada y criterio de valoración para el seguimiento durante los 2 meses de intervención.\n\nQuedo atento a su visto bueno para continuar con la aplicación del instrumento y la primera sesión filmada.`)}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado!' : 'Copiar Texto para WhatsApp'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
