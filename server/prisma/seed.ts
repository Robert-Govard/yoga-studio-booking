import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.service.count();
  if (existing > 0) {
    console.log(`Skipping seed: ${existing} service(s) already exist.`);
    return;
  }

  await prisma.service.createMany({
    data: [
      { name: 'Vinyasa Flow (60 min)', durationMinutes: 60, priceCents: 2500 },
      { name: 'Restorative Yoga (75 min)', durationMinutes: 75, priceCents: 3000 },
      { name: 'Private 1:1 Session (60 min)', durationMinutes: 60, priceCents: 8000 },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
