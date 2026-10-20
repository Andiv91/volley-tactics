const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const q = await prisma.question.findFirst({
    where: {
      title: {
        contains: 'sistema defensivo',
      },
    },
    include: {
      options: true,
    },
  });

  if (!q) {
    console.log('No se encontró la pregunta de sistema defensivo');
    return;
  }

  console.log('Pregunta encontrada:', q.title);
  console.log('Opciones actuales:', q.options.map(o => ({ id: o.id, text: o.text, imageUrl: o.imageUrl })));

  // Mapeo de imágenes por opción
  for (const opt of q.options) {
    let img = null;
    const lower = opt.text.toLowerCase();
    if (lower.includes('3-2-1')) {
      img = '/posiciones/14opciona-3-2-1.jpg';
    } else if (lower.includes('3-1-2')) {
      img = '/posiciones/rotacion_cancha_ejemplo.jpg';
    } else if (lower.includes('1-2-1-2') || lower.includes('1-2-2-1')) {
      img = '/posiciones/opcionc-1-2-1-2.jpg';
    } else if (lower.includes('2-1-2-1') || lower.includes('2-2-2')) {
      img = '/posiciones/2-1-2-1.jpg';
    }

    if (img) {
      await prisma.questionOption.update({
        where: { id: opt.id },
        data: { imageUrl: img },
      });
      console.log(`Opción actualizada con imagen: ${opt.text} -> ${img}`);
    }
  }

  // Clear parent question imageUrl so options display their own distinct diagrams
  await prisma.question.update({
    where: { id: q.id },
    data: { imageUrl: null },
  });
  console.log('Imagen de cabecera de la pregunta removida para dar protagonismo a los diagramas de las opciones.');

  console.log('--- Opciones actualizadas con éxito ---');
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
