const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const q = await prisma.question.findFirst({
    where: {
      title: { contains: 'sistema defensivo', mode: 'insensitive' },
    },
    include: {
      options: true,
    },
  });

  if (!q) {
    console.log('No se encontró la pregunta de sistema defensivo.');
    return;
  }

  console.log('Pregunta encontrada:', q.title);
  console.log('Opciones actuales:', q.options.map(o => ({ id: o.id, text: o.text, img: o.imageUrl })));

  for (const opt of q.options) {
    const textLower = opt.text.toLowerCase();
    let newText = opt.text;
    let newImg = opt.imageUrl;
    let newFeedback = opt.feedbackMessage;

    if (textLower.includes('3-2-1')) {
      newText = 'Defensa perimetral con bloqueo triple (Sistema 3-2-1)';
      newImg = '/posiciones/3-2-1.jpg';
      newFeedback = 'Sistema 3-2-1: Tres jugadores al bloqueo en la red, dos defensores medios en las líneas y un zaguero central profundo.';
    } else if (textLower.includes('3-1-2')) {
      newText = 'Defensa con jugador adelantado / rotación defensiva (Sistema 3-1-2)';
      newImg = '/posiciones/3-1-2.jpg';
      newFeedback = 'Sistema 3-1-2: Tres jugadores en el bloqueo, un jugador adelantado en zona 6 corta para fintas y dos zagueros en el fondo.';
    } else if (textLower.includes('1-2-1-2') || textLower.includes('1-2-2-1')) {
      newText = 'Defensa con un solo bloqueo y líneas escalonadas (Sistema 1-2-2-1)';
      newImg = '/posiciones/1-2-2-1.jpg';
      newFeedback = 'Sistema 1-2-2-1: Bloqueo simple individual con líneas de apoyo escalonadas para cubrir diagonales y balones colocados.';
    } else if (textLower.includes('2-1-2-1') || textLower.includes('2-2-2')) {
      newText = 'Defensa en tres líneas de dos jugadores (Sistema 2-2-2)';
      newImg = '/posiciones/2-2-2.jpg';
      newFeedback = 'Sistema 2-2-2: Dos jugadores al bloqueo en la red, dos en la zona intermedia y dos en el fondo de la cancha.';
    }

    await prisma.questionOption.update({
      where: { id: opt.id },
      data: {
        text: newText,
        imageUrl: newImg,
        feedbackMessage: newFeedback,
        isCorrect: true,
      },
    });

    console.log(`Actualizada opción ${opt.id}: "${newText}" -> img: ${newImg}`);
  }

  // Ensure parent question imageUrl is null so the options have the spotlight
  await prisma.question.update({
    where: { id: q.id },
    data: { imageUrl: null },
  });

  console.log('--- Proceso completado exitosamente ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
