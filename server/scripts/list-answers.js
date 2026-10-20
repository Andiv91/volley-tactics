const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function sortQuestionOptions(options) {
  if (!Array.isArray(options)) return [];
  return [...options].sort((a, b) => {
    const getPriority = (txt) => {
      const t = (txt || '').toLowerCase();
      if (t.includes('3-2-1')) return 1;
      if (t.includes('3-1-2')) return 2;
      if (t.includes('1-2-2-1') || t.includes('1-2-1-2')) return 3;
      if (t.includes('2-2-2') || t.includes('2-1-2-1')) return 4;
      return 99;
    };
    const pA = getPriority(a.text);
    const pB = getPriority(b.text);
    if (pA !== 99 || pB !== 99) {
      return pA - pB;
    }
    return 0;
  });
}

async function main() {
  const tests = await prisma.test.findMany({
    include: {
      testQuestions: {
        include: {
          question: {
            include: {
              category: true,
              options: true,
            },
          },
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  for (const test of tests) {
    console.log(`\n======================================================`);
    console.log(`TEST: "${test.title}" (ID: ${test.id})`);
    console.log(`Puntaje mínimo aprobación: ${test.passingScore}%`);
    console.log(`======================================================`);

    test.testQuestions.forEach((tq, qIdx) => {
      const q = tq.question;
      console.log(`\nPregunta ${qIdx + 1}: ${q.title}`);
      if (q.context) console.log(`Contexto: "${q.context}"`);
      const sortedOptions = sortQuestionOptions(q.options);
      sortedOptions.forEach((opt, optIdx) => {
        const letter = String.fromCharCode(65 + optIdx);
        const correctBadge = opt.isCorrect ? ' [CORRECTA] ***' : '';
        const imgInfo = opt.imageUrl ? ` (Con imagen: ${opt.imageUrl})` : '';
        console.log(`  ${letter}) ${opt.text}${correctBadge}${imgInfo}`);
      });
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
