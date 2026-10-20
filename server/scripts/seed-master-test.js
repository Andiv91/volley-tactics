const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('--- Iniciando creación del test de Maestría ---');

  // Categorías requeridas
  const categoryDefs = [
    { name: 'Táctica General', description: 'Conceptos y fundamentos teóricos de la táctica en el deporte', color: '#f59e0b', icon: 'Brain' },
    { name: 'Táctica Individual', description: 'Toma de decisiones independiente en ataque y defensa', color: '#10b981', icon: 'User' },
    { name: 'Táctica Colectiva', description: 'Organización, sincronización y táctica de grupo/equipo', color: '#3b82f6', icon: 'Users' },
    { name: 'Sistemas Tácticos', description: 'Estructuras y sistemas de juego en voleibol', color: '#8b5cf6', icon: 'Compass' },
    { name: 'Sistemas Ofensivos', description: 'Sistemas de ataque 5-1, 6-2 y 4-2', color: '#ec4899', icon: 'Flame' },
    { name: 'Sistemas Defensivos', description: 'Sistemas de bloqueo y defensa de campo perimetral y escalonada', color: '#ef4444', icon: 'Shield' },
    { name: 'Táctica Ofensiva', description: 'Ataque individual, colectivo y variantes tácticas', color: '#f97316', icon: 'Zap' },
  ];

  const catMap = {};
  for (const catDef of categoryDefs) {
    let cat = await prisma.category.findFirst({ where: { name: catDef.name } });
    if (!cat) {
      cat = await prisma.category.create({ data: catDef });
      console.log(`Categoría creada: ${cat.name} (${cat.id})`);
    } else {
      console.log(`Categoría existente: ${cat.name} (${cat.id})`);
    }
    catMap[catDef.name] = cat.id;
  }

  // 10 Preguntas del instrumento de Maestría
  const questionsData = [
    {
      title: '¿Qué entiende por táctica en el deporte?',
      context: 'Sección A: Conocimiento Conceptual de la Táctica. Fundamentos teóricos del voleibol.',
      difficulty: 'PRINCIPIANTE',
      phase: 'TEORICO',
      categoryName: 'Táctica General',
      options: [
        { text: 'Dominio técnico del balón (saque, pase, remate)', isCorrect: false, feedbackMessage: 'El dominio técnico corresponde a la técnica de ejecución de los fundamentos individuales, no a la toma de decisiones táctica.', scoreValue: 0 },
        { text: 'Estrategia para ganar', isCorrect: false, feedbackMessage: 'La estrategia es la planificación previa y global, mientras que la táctica es la resolución operativa durante el juego.', scoreValue: 0 },
        { text: 'Sistema de juego del equipo', isCorrect: false, feedbackMessage: 'El sistema de juego es la estructura posicional organizada, un componente de la táctica colectiva.', scoreValue: 0 },
        { text: 'Procedimientos racionales de solución de problemas en situaciones de juego orientados a vencer al rival', isCorrect: true, feedbackMessage: '¡Correcto! La táctica se define como los procedimientos racionales de toma de decisiones para resolver problemas motrices durante el juego.', scoreValue: 1 },
      ],
    },
    {
      title: 'La táctica individual en voleibol se define como:',
      context: 'Sección A: Conocimiento Conceptual de la Táctica. Toma de decisiones autónoma en cancha.',
      difficulty: 'PRINCIPIANTE',
      phase: 'TEORICO',
      categoryName: 'Táctica Individual',
      options: [
        { text: 'Ejecutar correctamente los fundamentos con el balón', isCorrect: false, feedbackMessage: 'Esto corresponde al componente de ejecución técnica motriz.', scoreValue: 0 },
        { text: 'Capacidad para resistir y enfrentar los problemas del partido', isCorrect: false, feedbackMessage: 'Esto se asocia a la preparación psicológica y condición física del atleta.', scoreValue: 0 },
        { text: 'Solucionar situaciones de juego de manera independiente (ej.: elegir la dirección del remate según el bloqueo)', isCorrect: true, feedbackMessage: '¡Correcto! La táctica individual es la toma de decisiones autónoma del jugador frente a una situación táctica específica.', scoreValue: 1 },
        { text: 'La toma de conciencia y la decisión de ejecutar la acción', isCorrect: false, feedbackMessage: 'Aunque involucra procesos cognitivos, la definición exige la resolución práctica e independiente de situaciones de juego.', scoreValue: 0 },
      ],
    },
    {
      title: '¿Qué entiende por táctica de grupo en voleibol?',
      context: 'Sección A: Conocimiento Conceptual de la Táctica. Coordinación en subgrupos de juego.',
      difficulty: 'INTERMEDIO',
      phase: 'TEORICO',
      categoryName: 'Táctica Colectiva',
      options: [
        { text: 'Procedimientos racionales en parejas, tríos o cuartetos (ej.: cobertura del rematador, combinación de bloqueo) que brindan soluciones efectivas a las situaciones de juego', isCorrect: true, feedbackMessage: '¡Correcto! La táctica grupal comprende las acciones coordinadas entre subgrupos de 2 a 4 jugadores que interactúan directamente.', scoreValue: 1 },
        { text: 'Ejecutar con eficiencia las acciones de juego haciendo los 3 toques', isCorrect: false, feedbackMessage: 'Los tres toques son un principio reglamentario general de posesión.', scoreValue: 0 },
        { text: 'Toma de decisión en la solución de situaciones de juego', isCorrect: false, feedbackMessage: 'Esta definición es genérica y no especifica la interacción de subgrupos.', scoreValue: 0 },
        { text: 'Brindar soluciones correctas a los problemas de juego', isCorrect: false, feedbackMessage: 'Definición incompleta que no abarca el trabajo cooperativo en parejas o subgrupos.', scoreValue: 0 },
      ],
    },
    {
      title: 'La táctica colectiva en voleibol es:',
      context: 'Sección A: Conocimiento Conceptual de la Táctica. Organización global del sexteto.',
      difficulty: 'INTERMEDIO',
      phase: 'TEORICO',
      categoryName: 'Táctica Colectiva',
      options: [
        { text: 'Procedimientos racionales de conjunto dentro del sistema de juego', isCorrect: false, feedbackMessage: 'Definición incompleta respecto a la sincronización y eficacia de todo el equipo.', scoreValue: 0 },
        { text: 'Procedimientos racionales utilizados por el equipo para solucionar eficientemente las situaciones dentro de los sistemas de juego', isCorrect: true, feedbackMessage: '¡Correcto! La táctica colectiva coordina e integra las acciones de los 6 jugadores en cancha de acuerdo con el sistema táctico adoptado.', scoreValue: 1 },
        { text: 'Procedimientos racionales individuales que brindan soluciones a los problemas de juego', isCorrect: false, feedbackMessage: 'Esto corresponde a la dimensión de táctica individual.', scoreValue: 0 },
        { text: 'Procedimientos racionales que solucionan situaciones de juego', isCorrect: false, feedbackMessage: 'Definición genérica de táctica, no específica de la dimensión colectiva.', scoreValue: 0 },
      ],
    },
    {
      title: '¿Qué es un sistema táctico?',
      context: 'Sección A: Conocimiento Conceptual de la Táctica. Estructura y dinámica de roles.',
      difficulty: 'INTERMEDIO',
      phase: 'TEORICO',
      categoryName: 'Sistemas Tácticos',
      options: [
        { text: 'Estrategia utilizada por el equipo durante un partido determinado', isCorrect: false, feedbackMessage: 'La estrategia es la planificación y dirección global previa.', scoreValue: 0 },
        { text: 'Acciones y movimientos del equipo frente al adversario', isCorrect: false, feedbackMessage: 'Esos son desplazamientos tácticos dinámicos durante la jugada.', scoreValue: 0 },
        { text: 'Formación inicial de los jugadores en el terreno de juego (rotación)', isCorrect: false, feedbackMessage: 'La rotación inicial es la disposición posicional básica antes del saque.', scoreValue: 0 },
        { text: 'Conjunto de elementos tácticos que en su interrelación permiten solucionar de manera organizada las situaciones de juego', isCorrect: true, feedbackMessage: '¡Correcto! Un sistema táctico articula de forma ordenada las posiciones, funciones y roles coordinados de todo el equipo en la cancha.', scoreValue: 1 },
      ],
    },
    {
      title: '¿Qué sistema ofensivo se caracteriza por emplear un único colocador y cinco rematadores potenciales?',
      context: 'Sección A: Sistemas tácticos ofensivos y especialización posicional.',
      difficulty: 'AVANZADO',
      phase: 'TEORICO',
      categoryName: 'Sistemas Ofensivos',
      options: [
        { text: 'Sistema 4-2 (dos colocadores delanteros y cuatro rematadores)', isCorrect: false, feedbackMessage: 'El 4-2 emplea dos colocadores y cuatro rematadores.', scoreValue: 0 },
        { text: 'Sistema 5-1 (un único colocador principal y cinco atacantes)', isCorrect: true, feedbackMessage: '¡Correcto! El sistema 5-1 emplea un solo armador en todas las rotaciones y cinco atacantes (incluido el opuesto).', scoreValue: 1 },
        { text: 'Sistema 6-2 (dos colocadores zagueros y seis rematadores)', isCorrect: false, feedbackMessage: 'El 6-2 utiliza dos colocadores que arman cuando están en zona zaguera.', scoreValue: 0 },
        { text: 'Sistema 3-3 (tres colocadores alternados con rematadores)', isCorrect: false, feedbackMessage: 'El 3-3 es un sistema de iniciación con tres pasadores.', scoreValue: 0 },
      ],
    },
    {
      title: 'La táctica ofensiva en voleibol es:',
      context: 'Sección B: Táctica Ofensiva. Construcción y resolución del ataque.',
      difficulty: 'PRINCIPIANTE',
      phase: 'TEORICO',
      categoryName: 'Táctica Ofensiva',
      options: [
        { text: 'Sistema ofensivo racional individual o colectivo dirigido a conseguir el punto (ej.: combinación de ataque, ataque por zaguero)', isCorrect: true, feedbackMessage: '¡Correcto! La táctica ofensiva engloba todos los procedimientos racionales orientados a superar la defensa rival y anotar el punto.', scoreValue: 1 },
        { text: 'Sistema de juego', isCorrect: false, feedbackMessage: 'El sistema de juego integra simultáneamente las fases ofensiva y defensiva.', scoreValue: 0 },
        { text: 'Remate efectivo', isCorrect: false, feedbackMessage: 'El remate es un fundamento técnico de culminación, pero la táctica ofensiva es mucho más amplia.', scoreValue: 0 },
        { text: 'Movimientos individuales del adversario en el terreno de juego', isCorrect: false, feedbackMessage: 'Esto hace referencia a las acciones del rival.', scoreValue: 0 },
      ],
    },
    {
      title: 'Se define como ataque individual a:',
      context: 'Sección B: Táctica Ofensiva. Toma de decisión del rematador frente al bloqueo.',
      difficulty: 'INTERMEDIO',
      phase: 'TEORICO',
      categoryName: 'Táctica Ofensiva',
      options: [
        { text: 'Acción colectiva en dirección al campo adversario', isCorrect: false, feedbackMessage: 'El enunciado especifica ataque individual, no una combinación colectiva.', scoreValue: 0 },
        { text: 'Ejecución de una acción ofensiva independiente que tiene como objetivo colocar el balón o rematar hacia el campo contrario', isCorrect: true, feedbackMessage: '¡Correcto! El ataque individual es la decisión técnico-táctica autónoma ejecutada por un atacante para vencer el bloqueo o la defensa rival.', scoreValue: 1 },
        { text: 'Jugadas realizadas en conjunto en dirección al campo adversario', isCorrect: false, feedbackMessage: 'Las jugadas en conjunto corresponden al ataque colectivo.', scoreValue: 0 },
        { text: 'Cuando ejecuta una acción ofensiva el adversario', isCorrect: false, feedbackMessage: 'Esto describe el ataque del equipo contrincante.', scoreValue: 0 },
      ],
    },
    {
      title: 'El ataque colectivo en voleibol se caracteriza por:',
      context: 'Sección B: Táctica Ofensiva. Combinaciones, fintas y sincronización armador-atacantes.',
      difficulty: 'AVANZADO',
      phase: 'TEORICO',
      categoryName: 'Táctica Ofensiva',
      options: [
        { text: 'Acciones de varias jugadas aisladas en el terreno de juego', isCorrect: false, feedbackMessage: 'Las jugadas aisladas no constituyen táctica colectiva sincronizada.', scoreValue: 0 },
        { text: 'Ejecución de acciones ofensivas sin coordinación', isCorrect: false, feedbackMessage: 'El ataque colectivo exige máxima sincronización temporal y espacial.', scoreValue: 0 },
        { text: 'Jugada del equipo que implica la combinación de 2 o varios atacantes (ej.: finta, jugada rápida, combinación en primer tiempo)', isCorrect: true, feedbackMessage: '¡Correcto! El ataque colectivo articula las trayectorias de múltiples atacantes coordinados con el colocador para desarticular el bloqueo rival.', scoreValue: 1 },
        { text: 'Cuando participa únicamente el rematador principal', isCorrect: false, feedbackMessage: 'La exclusividad de un solo rematador contradice la naturaleza colectiva de la jugada.', scoreValue: 0 },
      ],
    },
    {
      title: '¿Qué sistema defensivo utiliza su equipo con mayor frecuencia según la disposición táctica en cancha?',
      context: 'Sección C: Táctica Defensiva. Observa la distribución y rotación de los jugadores en los esquemas de cada opción.',
      difficulty: 'AVANZADO',
      phase: 'TEORICO',
      categoryName: 'Sistemas Defensivos',
      options: [
        { text: 'Defensa perimetral con bloqueo triple (Sistema 3-2-1)', imageUrl: '/posiciones/14opciona-3-2-1.jpg', isCorrect: true, feedbackMessage: 'Sistema 3-2-1: Tres jugadores al bloqueo en la red, dos defensores medios en las líneas y un zaguero central profundo.', scoreValue: 1 },
        { text: 'Defensa con jugador adelantado / rotación defensiva (Sistema 3-1-2)', imageUrl: '/posiciones/rotacion_cancha_ejemplo.jpg', isCorrect: true, feedbackMessage: 'Sistema 3-1-2: Tres en el bloqueo, un jugador adelantado en zona 6 corta para fintas y dos zagueros en el fondo.', scoreValue: 1 },
        { text: 'Defensa con 1 solo bloqueo y líneas escalonadas (Sistema 1-2-1-2 o 1-2-2-1)', imageUrl: '/posiciones/opcionc-1-2-1-2.jpg', isCorrect: true, feedbackMessage: 'Sistema 1-2-1-2 / 1-2-2-1: Bloqueo simple individual con líneas de apoyo escalonadas para cubrir diagonales y balones colocados.', scoreValue: 1 },
        { text: 'Defensa con 2 bloqueos y coberturas medias (Sistema 2-1-2-1 o 2-2-2)', imageUrl: '/posiciones/2-1-2-1.jpg', isCorrect: true, feedbackMessage: 'Sistema 2-1-2-1 / 2-2-2: Doble bloqueo en red, un apoyo intermedio y distribución en W invertida en zona zaguera.', scoreValue: 1 },
      ],
    },
  ];

  const createdQuestionIds = [];

  for (const qData of questionsData) {
    const categoryId = catMap[qData.categoryName];

    // Verificar si la pregunta ya existe para no duplicar
    let question = await prisma.question.findFirst({
      where: { title: qData.title },
      include: { options: true },
    });

    if (!question) {
      question = await prisma.question.create({
        data: {
          title: qData.title,
          context: qData.context,
          difficulty: qData.difficulty,
          phase: qData.phase,
          imageUrl: qData.imageUrl || null,
          categoryId,
          options: {
            create: qData.options.map((opt) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              feedbackMessage: opt.feedbackMessage,
              scoreValue: opt.scoreValue,
            })),
          },
        },
        include: { options: true },
      });
      console.log(`Pregunta creada: "${question.title.substring(0, 40)}..." (${question.id})`);
    } else {
      console.log(`Pregunta ya existente: "${question.title.substring(0, 40)}..." (${question.id})`);
      // Si tiene imageUrl y no estaba seteada, actualizarla
      if (qData.imageUrl && !question.imageUrl) {
        await prisma.question.update({
          where: { id: question.id },
          data: { imageUrl: qData.imageUrl },
        });
      }
    }
    createdQuestionIds.push(question.id);
  }

  // Crear o actualizar la Evaluación oficial de Maestría
  const testTitle = 'Cuestionario de Conocimiento Táctico Ofensivo y Defensivo en Voleibol (Maestría)';
  let test = await prisma.test.findFirst({
    where: { title: testTitle },
    include: { testQuestions: true },
  });

  if (!test) {
    test = await prisma.test.create({
      data: {
        title: testTitle,
        description: 'Instrumento oficial de recolección de datos para investigación de maestría: evaluación diagnóstica del conocimiento táctico individual, de grupo y colectivo en voleibol. Aplica escala de 4 niveles por cuartiles (Malo, Regular, Bueno, Excelente).',
        phase: 'TEORICO',
        durationMinutes: 30,
        passingScore: 50,
        scaleType: '4_TIER',
        competentThreshold: 50,
        professionalThreshold: 75,
        isActive: true,
        testQuestions: {
          create: createdQuestionIds.map((qId, idx) => ({
            questionId: qId,
            orderIndex: idx,
          })),
        },
      },
    });
    console.log(`\n¡Batería de Test de Maestría creada con éxito! ID: ${test.id}`);
  } else {
    // Asegurar que scaleType sea 4_TIER
    test = await prisma.test.update({
      where: { id: test.id },
      data: {
        scaleType: '4_TIER',
        durationMinutes: 30,
        passingScore: 50,
      },
    });
    console.log(`\nBatería de Test de Maestría actualizada ID: ${test.id} con scaleType = 4_TIER`);
  }

  // Sincronizar también en memoryDb store.json si existe para consistencia de fallbacks locales
  try {
    const fs = require('fs');
    const path = require('path');
    const storePath = path.join(__dirname, '..', 'data', 'store.json');
    if (fs.existsSync(storePath)) {
      const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      // Sincronizar categorías
      for (const catDef of categoryDefs) {
        if (!store.categories.some(c => c.name === catDef.name)) {
          store.categories.push({ id: `cat-${Date.now()}-${Math.random().toString(36).substring(7)}`, ...catDef });
        }
      }
      fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
      console.log('store.json de respaldo sincronizado.');
    }
  } catch (e) {
    console.warn('Nota sobre store.json:', e.message);
  }

  console.log('--- Proceso completado exitosamente ---');
}

seed()
  .catch((err) => {
    console.error('Error al sembrar datos:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
