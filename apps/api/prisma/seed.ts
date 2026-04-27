import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function upsertUser(
  email: string,
  username: string,
  plainPassword: string,
  color_custom?: string,
) {
  const password = await bcrypt.hash(plainPassword, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, username, password, color_custom },
  });
}

async function upsertRoom(name: string, isGeneral = false) {
  const existing = await prisma.room.findFirst({ where: { name, isGeneral } });
  if (existing) return existing;
  return prisma.room.create({ data: { name, isGeneral } });
}

async function addMember(roomId: string, userId: string, hasHistoryAccess = true) {
  return prisma.roomMember.upsert({
    where: { roomId_userId: { roomId, userId } },
    update: {},
    create: { roomId, userId, hasHistoryAccess },
  });
}

async function addMessage(roomId: string, authorId: string, content: string) {
  return prisma.message.create({ data: { roomId, authorId, content } });
}

async function addReaction(messageId: string, userId: string, emoji: string) {
  return prisma.reaction.upsert({
    where: { messageId_userId_emoji: { messageId, userId, emoji } },
    update: {},
    create: { messageId, userId, emoji },
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // --- Utilisateurs ----------------------------------------------------------
  const admin = await upsertUser('admin@orus.com', 'admin', 'admin', '#6366f1');
  console.log('✓ User: admin@orus.com / admin');

  const alice = await upsertUser('alice@orus.com', 'Alice', 'password123', '#ec4899');
  console.log('✓ User: alice@orus.com / password123');

  const bob = await upsertUser('bob@orus.com', 'Bob', 'password123', '#f97316');
  console.log('✓ User: bob@orus.com / password123');

  // --- Salons ----------------------------------------------------------------
  const generalRoom = await upsertRoom('Général', true);
  console.log('✓ Room: Général');

  const devRoom = await upsertRoom('Développement');
  console.log('✓ Room: Développement');

  const randomRoom = await upsertRoom('Random');
  console.log('✓ Room: Random');

  // --- Membres ---------------------------------------------------------------
  // Tous dans Général
  await addMember(generalRoom.id, admin.id);
  await addMember(generalRoom.id, alice.id);
  await addMember(generalRoom.id, bob.id);

  // Admin + Alice dans Développement
  await addMember(devRoom.id, admin.id);
  await addMember(devRoom.id, alice.id);

  // Alice + Bob dans Random
  await addMember(randomRoom.id, alice.id);
  await addMember(randomRoom.id, bob.id);

  console.log('✓ Membres ajoutés aux salons');

  // --- Messages & réactions : Général ----------------------------------------
  const m1 = await addMessage(generalRoom.id, admin.id, 'Bienvenue sur le chat ! 👋');
  const m2 = await addMessage(generalRoom.id, alice.id, "Merci, content d'être là !");
  const m3 = await addMessage(generalRoom.id, bob.id, 'Salut tout le monde !');
  const m4 = await addMessage(generalRoom.id, admin.id, "N'hésitez pas à poser vos questions.");

  await addReaction(m1.id, alice.id, '👋');
  await addReaction(m1.id, bob.id, '👋');
  await addReaction(m2.id, admin.id, '❤️');
  await addReaction(m3.id, alice.id, '😄');
  await addReaction(m4.id, alice.id, '👍');
  await addReaction(m4.id, bob.id, '👍');

  console.log('✓ Messages & réactions : Général');

  // --- Messages & réactions : Développement ----------------------------------
  const m5 = await addMessage(devRoom.id, alice.id, "J'ai fini la feature auth, quelqu'un peut review ?");
  const m6 = await addMessage(devRoom.id, admin.id, 'Je regarde ca ce soir.');
  const m7 = await addMessage(devRoom.id, alice.id, 'Super merci ! La PR est ouverte.');
  const m8 = await addMessage(devRoom.id, admin.id, 'Les DTOs sont bien structures, LGTM 🚀');

  await addReaction(m5.id, admin.id, '👀');
  await addReaction(m6.id, alice.id, '🙏');
  await addReaction(m8.id, alice.id, '🎉');
  await addReaction(m8.id, alice.id, '🚀');

  console.log('✓ Messages & réactions : Développement');

  // --- Messages & réactions : Random -----------------------------------------
  const m9  = await addMessage(randomRoom.id, bob.id, "Quelqu'un a regarde la derniere saison ?");
  const m10 = await addMessage(randomRoom.id, alice.id, 'Pas encore, pas de spoil !');
  const m11 = await addMessage(randomRoom.id, bob.id, "Promis 😇 C'est juste dingue.");
  const m12 = await addMessage(randomRoom.id, alice.id, "Ok la t'as mis l'eau a la bouche 😂");

  await addReaction(m9.id, alice.id, '👀');
  await addReaction(m10.id, bob.id, '😄');
  await addReaction(m11.id, alice.id, '😇');
  await addReaction(m12.id, bob.id, '😂');

  console.log('✓ Messages & réactions : Random');
}

main()
  .catch(console.error)
  .finally(() => void prisma.$disconnect());
