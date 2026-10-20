const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      teamId: true,
      team: { select: { id: true, name: true } },
    },
  });

  console.log(`Total users in DB: ${users.length}`);
  for (const u of users) {
    console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Role: ${u.role} | Team: ${u.team?.name || 'none'}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
