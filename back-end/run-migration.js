import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const sql = fs.readFileSync('setup.sql', 'utf8');
  await prisma.$executeRawUnsafe(sql);
  console.log('Tables created successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
