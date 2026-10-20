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
              options: true,
            },
          },
        },
      },
    },
  });

  for (const test of tests) {
    console.log(`Test: ${test.title}`);
    for (const tq of test.testQuestions) {
      if (tq.question.title.includes('sistema defensivo')) {
        console.log(' -> Sorted Question Options:');
        const sorted = sortQuestionOptions(tq.question.options);
        sorted.forEach((o, i) => {
          console.log(`    Opción ${String.fromCharCode(65 + i)}: ${o.text} | Imagen: ${o.imageUrl}`);
        });
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
