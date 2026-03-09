import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Utilisateur admin
  const password = await bcrypt.hash('admin', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@orus.com' },
    update: {},
    create: { email: 'admin@orus.com', username: 'admin', password },
  });
  console.log('✓ User: admin@orus.com / admin');

  // Salon général
  let generalRoom = await prisma.room.findFirst({ where: { isGeneral: true } });
  if (!generalRoom) {
    generalRoom = await prisma.room.create({
      data: { name: 'Général', isGeneral: true },
    });
    console.log('✓ Room: Général créé');
  }

  // Admin membre du salon général
  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: generalRoom.id, userId: admin.id } },
    update: {},
    create: { roomId: generalRoom.id, userId: admin.id, hasHistoryAccess: true },
  });
  console.log('✓ Admin ajouté au salon Général');
}

main()
  .catch(console.error)
  .finally(() => void prisma.$disconnect());
