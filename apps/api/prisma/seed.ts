import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('admin', 10);

  await prisma.user.upsert({
    where: { email: 'admin@orus.com' },
    update: {},
    create: {
      email: 'admin@orus.com',
      password,
    },
  });

  console.log('✓ Seeded: admin@orus.com / admin');
}

main()
  .catch(console.error)
  .finally(() => void prisma.$disconnect());
