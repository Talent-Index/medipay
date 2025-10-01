import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const commonPassword = 'Test@12345';
  const passwordHash = await bcrypt.hash(commonPassword, 10);

  // Simple deterministic addresses for local testing only
  const fixtures = [
    {
      address: '0xINSTITUTION00000000000000000000000000000001',
      email: 'institution@test.local',
      name: 'Test Healthcare Institution',
      role: 'INSTITUTION' as const,
    },
    {
      address: '0xINSURANCE000000000000000000000000000000001',
      email: 'insurance@test.local',
      name: 'Test Insurance Company',
      role: 'INSURANCE' as const,
    },
    {
      address: '0xDOCTOR00000000000000000000000000000000001',
      email: 'doctor@test.local',
      name: 'Test Healthcare Provider',
      role: 'DOCTOR' as const,
    },
  ];

  for (const user of fixtures) {
    await prisma.user.upsert({
      where: { address: user.address },
      update: {
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
      },
      create: {
        address: user.address,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordHash,
      },
    });
  }

  // Helpful console output
  console.log('\nSeeded test users with common password: Test@12345');
  console.table(
    fixtures.map((u) => ({ role: u.role, email: u.email, address: u.address }))
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


