import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

// Global singleton for Prisma Client
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export let prisma: PrismaClient;

// Only instantiate Prisma if DATABASE_URL is defined and looks like a valid postgres connection
let isPrismaAvailable = false;

if (config.databaseUrl && (config.databaseUrl.startsWith('postgres://') || config.databaseUrl.startsWith('postgresql://'))) {
  try {
    prisma = global.prisma || new PrismaClient();
    if (config.nodeEnv !== 'production') {
      global.prisma = prisma;
    }
    isPrismaAvailable = true;
    console.log('✅ Prisma configured with Neon PostgreSQL connection string');
  } catch (err) {
    console.warn('⚠️ Could not initialize Prisma client, fallback store will be active:', err);
    isPrismaAvailable = false;
  }
} else {
  console.log('ℹ️ No PostgreSQL DATABASE_URL detected. Activating built-in resilient Volleyball Data Store.');
}

// ==============================================================================
// In-Memory / File-backed Resilient Store (ensures 100% functionality out of the box)
// ==============================================================================

export interface UserEntity {
  id: string;
  email: string;
  password?: string | null;
  name: string;
  role: 'ADMIN' | 'USER';
  avatarUrl?: string | null;
  googleId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryEntity {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface OptionEntity {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  feedbackMessage: string;
  scoreValue: number;
}

export interface QuestionEntity {
  id: string;
  categoryId: string;
  categoryName?: string;
  title: string;
  context?: string;
  difficulty: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
  phase: 'TEORICO' | 'DECISION_VIDEO' | 'POST_PARTIDO';
  imageUrl?: string | null;
  videoUrl?: string | null;
  options: OptionEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface TestEntity {
  id: string;
  title: string;
  description: string;
  phase: string;
  durationMinutes: number;
  passingScore: number;
  competentThreshold?: number;
  professionalThreshold?: number;
  isActive: boolean;
  questionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionAnswerEntity {
  id: string;
  submissionId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  feedbackGiven: string;
  categoryName: string;
}

export interface SubmissionEntity {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  testId: string;
  testTitle?: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  performanceLevel?: 'PRINCIPIANTE' | 'COMPETENTE' | 'PROFESIONAL';
  timeSpentSeconds: number;
  answers: SubmissionAnswerEntity[];
  createdAt: string;
}

// Seed Data
const defaultPasswordHash = bcrypt.hashSync('Admin123!', 10);
const defaultAthletePasswordHash = bcrypt.hashSync('User123!', 10);

export const memoryDb = {
  users: [
    {
      id: 'user-admin-1',
      email: 'admin@volleyball.edu',
      password: defaultPasswordHash,
      name: 'Director Técnico Morales',
      role: 'ADMIN',
      avatarUrl: '/icons/icondefault.png',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user-athlete-1',
      email: 'athlete@volleyball.edu',
      password: defaultAthletePasswordHash,
      name: 'Camila Ortiz (Punta Receptora)',
      role: 'USER',
      avatarUrl: '/icons/icondefault.png',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user-athlete-2',
      email: 'mateo@volleyball.edu',
      password: defaultAthletePasswordHash,
      name: 'Mateo Silva (Bloqueador Central)',
      role: 'USER',
      avatarUrl: '/icons/icondefault.png',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user-athlete-3',
      email: 'valeria@volleyball.edu',
      password: defaultAthletePasswordHash,
      name: 'Valeria Gómez (Líbero)',
      role: 'USER',
      avatarUrl: '/icons/icondefault.png',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as UserEntity[],

  categories: [
    {
      id: 'cat-k1',
      name: 'Táctica Ofensiva (K1 - Recepción y Ataque)',
      description: 'Fase de ataque a partir de la recepción del servicio rival, colocación y definición.',
      color: '#ef4444',
      icon: 'Flame',
    },
    {
      id: 'cat-k2',
      name: 'Táctica Defensiva (K2 - Bloqueo y Defensa)',
      description: 'Fase defensiva a partir del servicio propio: bloqueo, defensa de campo y contraataque.',
      color: '#f97316',
      icon: 'Shield',
    },
    {
      id: 'cat-percepcion',
      name: 'Atención y Percepción Visual',
      description: 'Lectura de trayectorias, ángulos de batida y movimientos sutiles del armador/atacante.',
      color: '#8b5cf6',
      icon: 'Eye',
    },
    {
      id: 'cat-decisiones',
      name: 'Toma de Decisiones en Cancha',
      description: 'Resolución de jugadas críticas bajo presión de tiempo y variabilidad del entorno.',
      color: '#06b6d4',
      icon: 'Zap',
    },
    {
      id: 'cat-etica',
      name: 'Ética Deportiva y Convivencia',
      description: 'Gestión emocional, respeto a árbitros y compañeros, juego limpio y autocontrol.',
      color: '#10b981',
      icon: 'Heart',
    },
  ] as CategoryEntity[],

  questions: [
    {
      id: 'q-1',
      categoryId: 'cat-k1',
      title: '¿Hacia qué zona debe dirigirse prioritariamente la recepción ante un saque flotante agresivo?',
      context: 'El rival ejecuta un saque flotante potente que cae entre zona 5 y 6.',
      difficulty: 'INTERMEDIO',
      phase: 'TEORICO',
      imageUrl: 'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=1000&q=80',
      videoUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      options: [
        {
          id: 'opt-1-a',
          questionId: 'q-1',
          text: 'A la zona 2-3 (a 1 metro de la red) para permitir juego rápido y fijar el bloqueo rival con los centrales.',
          isCorrect: true,
          feedbackMessage: '¡Excelente lectura táctica! Una entrega a 1 metro de la red entre zonas 2 y 3 maximiza las opciones de ataque del colocador y deja desprotegido el bloqueo rival.',
          scoreValue: 1,
        },
        {
          id: 'opt-1-b',
          questionId: 'q-1',
          text: 'Muy alta y bombeada hacia el fondo de zona 6 para evitar que caiga al suelo.',
          isCorrect: false,
          feedbackMessage: 'Aunque evitas el error directo de saque, un pase bombeado a zona 6 anula la velocidad del ataque K1 y le da al rival tiempo de armar un bloqueo triple estructurado.',
          scoreValue: 0,
        },
        {
          id: 'opt-1-c',
          questionId: 'q-1',
          text: 'Intentar pasarla de primer toque directamente al campo contrario con antebrazos.',
          isCorrect: false,
          feedbackMessage: '¡Error táctico crítico! Pasar el balón en primer toque entrega un freeball fácil al rival, concediendo un contraataque K2 inmediato.',
          scoreValue: 0,
        },
      ],
    },
    {
      id: 'q-2',
      categoryId: 'cat-etica',
      title: 'El árbitro cobra un toque de red que consideras inexistente y el rival celebra burlonamente. ¿Cómo respondes?',
      context: 'Set decisivo 23-23. Alta tensión y ruido en el pabellón universitario.',
      difficulty: 'PRINCIPIANTE',
      phase: 'TEORICO',
      imageUrl: '',
      videoUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      options: [
        {
          id: 'opt-2-a',
          questionId: 'q-2',
          text: '¿Golpear o encarar físicamente al jugador rival que se burló para imponer respeto?',
          isCorrect: false,
          feedbackMessage: '¡Conducta totalmente prohibida e inaceptable! En el voleibol y el deporte universitario, cualquier agresión física o verbal conlleva expulsión inmediata, tarjeta roja y descalificación del torneo. La verdadera fortaleza deportiva se demuestra con madurez emocional y respondiendo con puntos en la cancha.',
          scoreValue: 0,
        },
        {
          id: 'opt-2-b',
          questionId: 'q-2',
          text: 'El capitán en cancha se acerca respetuosamente al primer árbitro a solicitar aclaración formal, mientras el equipo se reagrupa enfocado.',
          isCorrect: true,
          feedbackMessage: '¡Procedimiento ejemplar! El reglamento oficial FIVB estipula que únicamente el capitán en cancha tiene derecho a consultar con el árbitro. Esto mantiene la calma y protege la concentración del equipo.',
          scoreValue: 1,
        },
        {
          id: 'opt-2-c',
          questionId: 'q-2',
          text: 'Patear el balón hacia las gradas y discutir con el público rival.',
          isCorrect: false,
          feedbackMessage: 'Comportamiento antideportivo que acarrea sanción por demora o tarjeta amarilla, además de perjudicar la concentración de tus propios compañeros.',
          scoreValue: 0,
        },
      ],
    },
    {
      id: 'q-3',
      categoryId: 'cat-k2',
      title: 'Análisis situacional: Decisión de bloqueo ante colocación abierta de emergencia a zona 4',
      context: 'El colocador rival recibe fuera de los 3 metros y levanta un balón alto y retrasado para su atacante exterior.',
      difficulty: 'AVANZADO',
      phase: 'DECISION_VIDEO',
      imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1000&q=80',
      videoUrl: 'https://www.youtube.com/watch?v=9No-FiEInLA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      options: [
        {
          id: 'opt-3-a',
          questionId: 'q-3',
          text: 'Bloqueo doble compacto cerrando la diagonal fuerte (corte a zona 5), cediendo la línea a la defensa baja.',
          isCorrect: true,
          feedbackMessage: '¡Brillante lectura táctica! Ante un balón separado, el rematador tiene un ángulo biomecánico natural hacia la diagonal. Cerrar la diagonal anula su golpe más contundente y facilita el trabajo del líbero.',
          scoreValue: 1,
        },
        {
          id: 'opt-3-b',
          questionId: 'q-3',
          text: 'Saltar anticipadamente antes de que el rematador inicie su batida para presionarlo visualmente.',
          isCorrect: false,
          feedbackMessage: 'Saltar antes de tiempo hace que caigas al piso mientras el atacante aún está en el aire, dejándole la red completamente libre para rematar o buscar tus dedos descendentes.',
          scoreValue: 0,
        },
        {
          id: 'opt-3-c',
          questionId: 'q-3',
          text: 'Desarmar el bloqueo y correr todos al fondo de la cancha a esperar el golpe.',
          isCorrect: false,
          feedbackMessage: 'Nunca se debe desarmar el bloqueo ante un remate de punta; sin bloqueo, el atacante rival puede imprimir 110 km/h sin obstáculo.',
          scoreValue: 0,
        },
      ],
    },
    {
      id: 'q-4',
      categoryId: 'cat-percepcion',
      title: 'Lectura visual: El hombro del atacante se frena y el codo queda bajo durante la suspensión',
      context: 'El atacante salta con velocidad en zona 2 pero frena bruscamente su brazo en el punto más alto del salto.',
      difficulty: 'INTERMEDIO',
      phase: 'DECISION_VIDEO',
      imageUrl: 'https://images.unsplash.com/photo-1596707328906-8d63a3d53bc5?auto=format&fit=crop&w=1000&q=80',
      videoUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      options: [
        {
          id: 'opt-4-a',
          questionId: 'q-4',
          text: 'Anticipar una finta (toque suave/deje) y acelerar la cobertura defensiva hacia la zona corta tras el bloqueo.',
          isCorrect: true,
          feedbackMessage: '¡Excelente percepción visual! La desaceleración del hombro y el codo bajo son indicadores biomecánicos inequívocos de que no habrá remate potente, sino un toque colocado.',
          scoreValue: 1,
        },
        {
          id: 'opt-4-b',
          questionId: 'q-4',
          text: 'Saltar aún más alto esperando un remate al piso de máxima potencia.',
          isCorrect: false,
          feedbackMessage: 'Es anatómicamente imposible generar máxima potencia con el codo bajo y el hombro frenado. Si saltas más alto, el balón pasará por encima de tus manos en un toque bombeado a tu espalda.',
          scoreValue: 0,
        },
        {
          id: 'opt-4-c',
          questionId: 'q-4',
          text: 'Desviar la mirada hacia el árbitro de línea esperando que pite fuera.',
          isCorrect: false,
          feedbackMessage: 'Perder de vista el balón en plena fase de juego es un error fundamental de atención.',
          scoreValue: 0,
        },
      ],
    },
    {
      id: 'q-5',
      categoryId: 'cat-decisiones',
      title: 'Decisión K1 de emergencia: Balón separado a 3 metros de la red contra bloqueo triple',
      context: 'Colocación forzada contra el viento o recepción defectuosa. El atacante debe resolver.',
      difficulty: 'AVANZADO',
      phase: 'POST_PARTIDO',
      imageUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1000&q=80',
      videoUrl: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      options: [
        {
          id: 'opt-5-a',
          questionId: 'q-5',
          text: 'Buscar un remate dirigido hacia las puntas de los dedos externos del bloqueo para forzar un block-out (toque y fuera).',
          isCorrect: true,
          feedbackMessage: '¡Maestría en toma de decisiones! Con bloqueo triple formado y balón separado, el remate al block-out es la jugada con mayor porcentaje de éxito en el voleibol de alto nivel.',
          scoreValue: 1,
        },
        {
          id: 'opt-5-b',
          questionId: 'q-5',
          text: 'Rematar de lleno y con los ojos cerrados contra el centro de las manos de los 3 bloqueadores.',
          isCorrect: false,
          feedbackMessage: 'Rematar directo al centro de un bloqueo triple compacto suele resultar en un tapón que cae a tus propios pies en milisegundos.',
          scoreValue: 0,
        },
        {
          id: 'opt-5-c',
          questionId: 'q-5',
          text: 'Dejar caer el balón sin tocarlo porque el pase no fue perfecto.',
          isCorrect: false,
          feedbackMessage: 'Una actitud inaceptable para un competidor. Todo balón en juego debe lucharse hasta el pitazo final.',
          scoreValue: 0,
        },
      ],
    },
  ] as QuestionEntity[],

  tests: [
    {
      id: 'test-1',
      title: 'Evaluación Táctica Integral: K1, K2 y Toma de Decisiones',
      description: 'Evaluación teórica y situacional sobre sistemas de recepción, bloqueo, percepción visual y ética deportiva.',
      phase: 'INTEGRAL',
      durationMinutes: 15,
      passingScore: 70,
      isActive: true,
      questionIds: ['q-1', 'q-2', 'q-3', 'q-4', 'q-5'],
      createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'test-2',
      title: 'Fase K1: Recepción, Distribución y Principios de Ataque',
      description: 'Test enfocado en táctica ofensiva, calidad de recepción y resolución en la red.',
      phase: 'TEORICO',
      durationMinutes: 10,
      passingScore: 80,
      isActive: true,
      questionIds: ['q-1', 'q-5'],
      createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'test-3',
      title: 'Percepción Visual, Toma de Decisiones y Ética Deportiva',
      description: 'Análisis de lectura corporal del rival y protocolos de conducta en situaciones de alta presión.',
      phase: 'DECISION_VIDEO',
      durationMinutes: 12,
      passingScore: 75,
      isActive: true,
      questionIds: ['q-2', 'q-3', 'q-4'],
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as TestEntity[],

  submissions: [
    {
      id: 'sub-1',
      userId: 'user-athlete-1',
      userName: 'Camila Ortiz (Punta Receptora)',
      userEmail: 'athlete@volleyball.edu',
      testId: 'test-1',
      testTitle: 'Evaluación Táctica Integral: K1, K2 y Toma de Decisiones',
      score: 5,
      maxScore: 5,
      percentage: 100,
      passed: true,
      timeSpentSeconds: 420,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      answers: [
        {
          id: 'sub-ans-1',
          submissionId: 'sub-1',
          questionId: 'q-1',
          selectedOptionId: 'opt-1-a',
          isCorrect: true,
          feedbackGiven: '¡Excelente lectura táctica! Una entrega a 1 metro de la red entre zonas 2 y 3 maximiza las opciones de ataque del colocador y deja desprotegido el bloqueo rival.',
          categoryName: 'Táctica Ofensiva (K1 - Recepción y Ataque)',
        },
        {
          id: 'sub-ans-2',
          submissionId: 'sub-1',
          questionId: 'q-2',
          selectedOptionId: 'opt-2-b',
          isCorrect: true,
          feedbackGiven: '¡Procedimiento ejemplar! El reglamento oficial FIVB estipula que únicamente el capitán en cancha tiene derecho a consultar con el árbitro. Esto mantiene la calma y protege la concentración del equipo.',
          categoryName: 'Ética Deportiva y Convivencia',
        },
        {
          id: 'sub-ans-3',
          submissionId: 'sub-1',
          questionId: 'q-3',
          selectedOptionId: 'opt-3-a',
          isCorrect: true,
          feedbackGiven: '¡Brillante lectura táctica! Ante un balón separado, el rematador tiene un ángulo biomecánico natural hacia la diagonal. Cerrar la diagonal anula su golpe más contundente y facilita el trabajo del líbero.',
          categoryName: 'Táctica Defensiva (K2 - Bloqueo y Defensa)',
        },
        {
          id: 'sub-ans-4',
          submissionId: 'sub-1',
          questionId: 'q-4',
          selectedOptionId: 'opt-4-a',
          isCorrect: true,
          feedbackGiven: '¡Excelente percepción visual! La desaceleración del hombro y el codo bajo son indicadores biomecánicos inequívocos de que no habrá remate potente, sino un toque colocado.',
          categoryName: 'Atención y Percepción Visual',
        },
        {
          id: 'sub-ans-5',
          submissionId: 'sub-1',
          questionId: 'q-5',
          selectedOptionId: 'opt-5-a',
          isCorrect: true,
          feedbackGiven: '¡Maestría en toma de decisiones! Con bloqueo triple formado y balón separado, el remate al block-out es la jugada con mayor porcentaje de éxito en el voleibol de alto nivel.',
          categoryName: 'Toma de Decisiones en Cancha',
        },
      ],
    },
    {
      id: 'sub-2',
      userId: 'user-athlete-2',
      userName: 'Mateo Silva (Bloqueador Central)',
      userEmail: 'mateo@volleyball.edu',
      testId: 'test-1',
      testTitle: 'Evaluación Táctica Integral: K1, K2 y Toma de Decisiones',
      score: 3,
      maxScore: 5,
      percentage: 60,
      passed: false,
      timeSpentSeconds: 510,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      answers: [
        {
          id: 'sub-ans-6',
          submissionId: 'sub-2',
          questionId: 'q-1',
          selectedOptionId: 'opt-1-b',
          isCorrect: false,
          feedbackGiven: 'Aunque evitas el error directo de saque, un pase bombeado a zona 6 anula la velocidad del ataque K1 y le da al rival tiempo de armar un bloqueo triple estructurado.',
          categoryName: 'Táctica Ofensiva (K1 - Recepción y Ataque)',
        },
        {
          id: 'sub-ans-7',
          submissionId: 'sub-2',
          questionId: 'q-2',
          selectedOptionId: 'opt-2-b',
          isCorrect: true,
          feedbackGiven: '¡Procedimiento ejemplar! El reglamento oficial FIVB estipula que únicamente el capitán en cancha tiene derecho a consultar con el árbitro.',
          categoryName: 'Ética Deportiva y Convivencia',
        },
        {
          id: 'sub-ans-8',
          submissionId: 'sub-2',
          questionId: 'q-3',
          selectedOptionId: 'opt-3-a',
          isCorrect: true,
          feedbackGiven: '¡Brillante lectura táctica! Cerrar la diagonal anula su golpe más contundente.',
          categoryName: 'Táctica Defensiva (K2 - Bloqueo y Defensa)',
        },
        {
          id: 'sub-ans-9',
          submissionId: 'sub-2',
          questionId: 'q-4',
          selectedOptionId: 'opt-4-b',
          isCorrect: false,
          feedbackGiven: 'Es anatómicamente imposible generar máxima potencia con el codo bajo y el hombro frenado.',
          categoryName: 'Atención y Percepción Visual',
        },
        {
          id: 'sub-ans-10',
          submissionId: 'sub-2',
          questionId: 'q-5',
          selectedOptionId: 'opt-5-a',
          isCorrect: true,
          feedbackGiven: '¡Maestría en toma de decisiones! Con bloqueo triple formado y balón separado, el remate al block-out es la jugada con mayor porcentaje de éxito.',
          categoryName: 'Toma de Decisiones en Cancha',
        },
      ],
    },
  ] as SubmissionEntity[],
};

const storeFilePath = path.resolve(__dirname, '../../data/store.json');

export function saveStore() {
  try {
    fs.writeFileSync(storeFilePath, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Error guardando store en disco:', err);
  }
}

export function loadStore() {
  try {
    if (fs.existsSync(storeFilePath)) {
      const content = fs.readFileSync(storeFilePath, 'utf8');
      const data = JSON.parse(content);
      if (data.users && data.categories && data.questions && data.tests && data.submissions) {
        memoryDb.users = data.users;
        memoryDb.categories = data.categories;
        memoryDb.questions = data.questions;
        memoryDb.tests = data.tests;
        memoryDb.submissions = data.submissions;
        console.log('✅ Datos persistentes cargados correctamente desde server/data/store.json');
        return;
      }
    }
    // Si no existe, creamos el archivo inicial con los datos semilla
    saveStore();
    console.log('✅ Archivo inicial server/data/store.json creado con datos semilla.');
  } catch (err) {
    console.error('Error cargando store desde disco:', err);
  }
}

// Cargar datos al iniciar
loadStore();

export { isPrismaAvailable };
