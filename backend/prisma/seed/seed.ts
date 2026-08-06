import 'dotenv/config';

import bcrypt from 'bcrypt';

import prisma from '../../src/database/prisma';

const ROLES = [
  { nombre: 'ADMIN', descripcion: 'Administrador del sistema' },
  { nombre: 'CLIENTE', descripcion: 'Cliente del sistema' },
] as const;

const ADMIN_USER = {
  nombre: 'Administrador',
  apellido: 'Sistema',
  email: 'admin@canchas.com',
  password: 'Admin123*',
};

async function main(): Promise<void> {
  for (const rol of ROLES) {
    await prisma.rol.upsert({
      where: { nombre: rol.nombre },
      update: {},
      create: {
        nombre: rol.nombre,
        descripcion: rol.descripcion,
      },
    });
  }

  const adminRole = await prisma.rol.findUnique({
    where: { nombre: 'ADMIN' },
  });

  if (!adminRole) {
    throw new Error('El rol ADMIN no pudo ser creado o encontrado.');
  }

  const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);

  await prisma.usuario.upsert({
    where: { email: ADMIN_USER.email },
    update: {},
    create: {
      nombre: ADMIN_USER.nombre,
      apellido: ADMIN_USER.apellido,
      email: ADMIN_USER.email,
      password: hashedPassword,
      rolId: adminRole.id,
    },
  });

  console.log('Seed completado: roles y usuario administrador listos.');
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
