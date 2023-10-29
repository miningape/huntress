import { PrismaClient } from '@prisma/client';

async function seed() {
  const prisma = new PrismaClient();

  await prisma.job.create({
    data: {
      type: 'Pipeline',
      definition: {},
      interval: '* 2 * * * *',
      stopped: false,
    },
  });
}

seed();
