import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Neon PostgreSQL database seeding...');

  // 1. Clean existing records if any
  await prisma.submissionAnswer.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.testQuestion.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.test.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create default Admin & Athlete users
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('User123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@volleyball.edu',
      name: 'Director Técnico Morales',
      password: adminPassword,
      role: 'ADMIN',
      avatarUrl: '/icons/icondefault.png',
    },
  });

  const athlete1 = await prisma.user.create({
    data: {
      email: 'athlete@volleyball.edu',
      name: 'Camila Ortiz (Punta Receptora)',
      password: userPassword,
      role: 'USER',
      avatarUrl: '/icons/icondefault.png',
    },
  });

  const athlete2 = await prisma.user.create({
    data: {
      email: 'mateo@volleyball.edu',
      name: 'Mateo Silva (Bloqueador Central)',
      password: userPassword,
      role: 'USER',
      avatarUrl: '/icons/icondefault.png',
    },
  });

  // 3. Create Categories
  const catK1 = await prisma.category.create({
    data: {
      name: 'Táctica Ofensiva (K1 - Recepción y Ataque)',
      description: 'Fase de ataque a partir de la recepción del servicio rival, colocación y definición.',
      color: '#ef4444',
      icon: 'Flame',
    },
  });

  const catK2 = await prisma.category.create({
    data: {
      name: 'Táctica Defensiva (K2 - Bloqueo y Defensa)',
      description: 'Fase defensiva a partir del servicio propio: bloqueo, defensa de campo y contraataque.',
      color: '#f97316',
      icon: 'Shield',
    },
  });

  const catPercepcion = await prisma.category.create({
    data: {
      name: 'Atención y Percepción Visual',
      description: 'Lectura de trayectorias, ángulos de batida y movimientos sutiles del armador/atacante.',
      color: '#8b5cf6',
      icon: 'Eye',
    },
  });

  const catDecisiones = await prisma.category.create({
    data: {
      name: 'Toma de Decisiones en Cancha',
      description: 'Resolución de jugadas críticas bajo presión de tiempo y variabilidad del entorno.',
      color: '#06b6d4',
      icon: 'Zap',
    },
  });

  const catEtica = await prisma.category.create({
    data: {
      name: 'Ética Deportiva y Convivencia',
      description: 'Gestión emocional, respeto a árbitros y compañeros, juego limpio y autocontrol.',
      color: '#10b981',
      icon: 'Heart',
    },
  });

  // 4. Create Questions with Options and per-option Feedback
  const q1 = await prisma.question.create({
    data: {
      categoryId: catK1.id,
      title: '¿Hacia qué zona debe dirigirse prioritariamente la recepción ante un saque flotante agresivo?',
      context: 'El rival ejecuta un saque flotante potente que cae entre zona 5 y 6.',
      difficulty: 'INTERMEDIO',
      phase: 'TEORICO',
      imageUrl: 'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=1000&q=80',
      options: {
        create: [
          {
            text: 'A la zona 2-3 (a 1 metro de la red) para permitir juego rápido y fijar el bloqueo rival con los centrales.',
            isCorrect: true,
            feedbackMessage: '¡Excelente lectura táctica! Una entrega a 1 metro de la red entre zonas 2 y 3 maximiza las opciones de ataque del colocador y deja desprotegido el bloqueo rival.',
            scoreValue: 1,
          },
          {
            text: 'Muy alta y bombeada hacia el fondo de zona 6 para evitar que caiga al suelo.',
            isCorrect: false,
            feedbackMessage: 'Aunque evitas el error directo de saque, un pase bombeado a zona 6 anula la velocidad del ataque K1 y le da al rival tiempo de armar un bloqueo triple estructurado.',
            scoreValue: 0,
          },
          {
            text: 'Intentar pasarla de primer toque directamente al campo contrario con antebrazos.',
            isCorrect: false,
            feedbackMessage: '¡Error táctico crítico! Pasar el balón en primer toque entrega un freeball fácil al rival, concediendo un contraataque K2 inmediato.',
            scoreValue: 0,
          },
        ],
      },
    },
    include: { options: true },
  });

  const q2 = await prisma.question.create({
    data: {
      categoryId: catEtica.id,
      title: 'El árbitro cobra un toque de red que consideras inexistente y el rival celebra burlonamente. ¿Cómo respondes?',
      context: 'Set decisivo 23-23. Alta tensión y ruido en el pabellón universitario.',
      difficulty: 'PRINCIPIANTE',
      phase: 'TEORICO',
      options: {
        create: [
          {
            text: '¿Golpear o encarar físicamente al jugador rival que se burló para imponer respeto?',
            isCorrect: false,
            feedbackMessage: '¡Conducta totalmente prohibida e inaceptable! En el voleibol y el deporte universitario, cualquier agresión física o verbal conlleva expulsión inmediata, tarjeta roja y descalificación del torneo. La verdadera fortaleza deportiva se demuestra con madurez emocional.',
            scoreValue: 0,
          },
          {
            text: 'El capitán en cancha se acerca respetuosamente al primer árbitro a solicitar aclaración formal, mientras el equipo se reagrupa enfocado.',
            isCorrect: true,
            feedbackMessage: '¡Procedimiento ejemplar! El reglamento oficial FIVB estipula que únicamente el capitán en cancha tiene derecho a consultar con el árbitro. Esto mantiene la calma y protege la concentración del equipo.',
            scoreValue: 1,
          },
          {
            text: 'Patear el balón hacia las gradas y discutir con el público rival.',
            isCorrect: false,
            feedbackMessage: 'Comportamiento antideportivo que acarrea sanción por demora o tarjeta amarilla, además de perjudicar la concentración de tus propios compañeros.',
            scoreValue: 0,
          },
        ],
      },
    },
    include: { options: true },
  });

  const q3 = await prisma.question.create({
    data: {
      categoryId: catK2.id,
      title: 'Análisis situacional: Decisión de bloqueo ante colocación abierta de emergencia a zona 4',
      context: 'El colocador rival recibe fuera de los 3 metros y levanta un balón alto y retrasado para su atacante exterior.',
      difficulty: 'AVANZADO',
      phase: 'DECISION_VIDEO',
      imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1000&q=80',
      videoUrl: 'https://www.youtube.com/watch?v=9No-FiEInLA',
      options: {
        create: [
          {
            text: 'Bloqueo doble compacto cerrando la diagonal fuerte (corte a zona 5), cediendo la línea a la defensa baja.',
            isCorrect: true,
            feedbackMessage: '¡Brillante lectura táctica! Ante un balón separado, el rematador tiene un ángulo biomecánico natural hacia la diagonal. Cerrar la diagonal anula su golpe más contundente.',
            scoreValue: 1,
          },
          {
            text: 'Saltar anticipadamente antes de que el rematador inicie su batida para presionarlo visualmente.',
            isCorrect: false,
            feedbackMessage: 'Saltar antes de tiempo hace que caigas al piso mientras el atacante aún está en el aire, dejándole la red completamente libre para rematar.',
            scoreValue: 0,
          },
          {
            text: 'Desarmar el bloqueo y correr todos al fondo de la cancha a esperar el golpe.',
            isCorrect: false,
            feedbackMessage: 'Nunca se debe desarmar el bloqueo ante un remate de punta; sin bloqueo, el atacante rival puede rematar sin resistencia.',
            scoreValue: 0,
          },
        ],
      },
    },
    include: { options: true },
  });

  // 5. Create Test
  const test1 = await prisma.test.create({
    data: {
      title: 'Evaluación Táctica Integral: K1, K2 y Toma de Decisiones',
      description: 'Evaluación teórica y situacional sobre sistemas de recepción, bloqueo, percepción visual y ética deportiva.',
      phase: 'INTEGRAL',
      durationMinutes: 15,
      passingScore: 70,
      isActive: true,
      testQuestions: {
        create: [
          { questionId: q1.id, orderIndex: 0 },
          { questionId: q2.id, orderIndex: 1 },
          { questionId: q3.id, orderIndex: 2 },
        ],
      },
    },
  });

  console.log(`✅ Base de datos sembrada con éxito: Test '${test1.title}', 3 preguntas, usuarios admin y atletas.`);
}

main()
  .catch((e) => {
    console.error('Error durante el sembrado de Prisma:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
