import 'dotenv/config';

import bcrypt from 'bcrypt';
import { DiaSemana } from '@prisma/client';

import prisma from '../../src/database/prisma';
import { parseTimeString } from '../../src/utils/time.utils';

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

const COURT_TYPES = [
  { nombre: 'Fútbol 11', descripcion: 'Cancha reglamentaria para fútbol once' },
  { nombre: 'Fútbol 7', descripcion: 'Cancha sintética para fútbol siete' },
  { nombre: 'Tenis', descripcion: 'Cancha de tenis con superficie dura' },
  { nombre: 'Pádel', descripcion: 'Cancha cerrada para pádel' },
  { nombre: 'Vóley', descripcion: 'Cancha de vóley indoor y outdoor' },
  { nombre: 'Baloncesto', descripcion: 'Cancha de baloncesto con tableros reglamentarios' },
] as const;

const COURTS = [
  {
    codigo: 'CAN-001',
    nombre: 'Cancha Central Fútbol 11',
    descripcion: 'Cancha principal con césped sintético e iluminación LED',
    precioHora: 80,
    capacidad: 22,
    ubicacion: 'Sector A - Planta baja',
    imagen: '/images/complejo.jpg',
    tipoCanchaNombre: 'Fútbol 11',
  },
  {
    codigo: 'CAN-002',
    nombre: 'Cancha Norte Fútbol 7',
    descripcion: 'Espacio ideal para partidos rápidos y entrenamientos',
    precioHora: 45,
    capacidad: 14,
    ubicacion: 'Sector B - Nivel 1',
    imagen: '/images/cancha.jpg',
    tipoCanchaNombre: 'Fútbol 7',
  },
  {
    codigo: 'CAN-003',
    nombre: 'Cancha Sur Fútbol 7',
    descripcion: 'Cancha techada con graderío lateral',
    precioHora: 45,
    capacidad: 14,
    ubicacion: 'Sector B - Nivel 1',
    imagen: '/images/cancha2.jpg',
    tipoCanchaNombre: 'Fútbol 7',
  },
  {
    codigo: 'CAN-004',
    nombre: 'Cancha Tenis A',
    descripcion: 'Superficie dura con marcado reglamentario',
    precioHora: 35,
    capacidad: 4,
    ubicacion: 'Sector C - Exterior',
    imagen: '/images/tenis.jpg',
    tipoCanchaNombre: 'Tenis',
  },
  {
    codigo: 'CAN-005',
    nombre: 'Cancha Tenis B',
    descripcion: 'Cancha con vestuarios y área de descanso',
    precioHora: 35,
    capacidad: 4,
    ubicacion: 'Sector C - Exterior',
    imagen: '/images/tenis.jpg',
    tipoCanchaNombre: 'Tenis',
  },
  {
    codigo: 'CAN-006',
    nombre: 'Cancha Pádel 1',
    descripcion: 'Cancha de pádel con paredes de cristal',
    precioHora: 40,
    capacidad: 4,
    ubicacion: 'Sector D - Indoor',
    imagen: '/images/indor.jpg',
    tipoCanchaNombre: 'Pádel',
  },
  {
    codigo: 'CAN-007',
    nombre: 'Cancha Vóley',
    descripcion: 'Espacio multipropósito para vóley recreativo',
    precioHora: 30,
    capacidad: 12,
    ubicacion: 'Sector D - Indoor',
    imagen: '/images/indor.jpg',
    tipoCanchaNombre: 'Vóley',
  },
  {
    codigo: 'CAN-008',
    nombre: 'Cancha Baloncesto',
    descripcion: 'Cancha al aire libre con tableros profesionales',
    precioHora: 25,
    capacidad: 10,
    ubicacion: 'Sector E - Exterior',
    imagen: '/images/premium.jpg',
    tipoCanchaNombre: 'Baloncesto',
  },
] as const;

const SCHEDULE_SLOTS = [
  { horaInicio: '08:00:00', horaFin: '10:00:00' },
  { horaInicio: '10:00:00', horaFin: '12:00:00' },
  { horaInicio: '14:00:00', horaFin: '16:00:00' },
  { horaInicio: '18:00:00', horaFin: '20:00:00' },
] as const;

const WEEK_DAYS: DiaSemana[] = [
  DiaSemana.LUNES,
  DiaSemana.MARTES,
  DiaSemana.MIERCOLES,
  DiaSemana.JUEVES,
  DiaSemana.VIERNES,
  DiaSemana.SABADO,
  DiaSemana.DOMINGO,
];

async function seedCourtTypes(): Promise<Map<string, number>> {
  const courtTypeIds = new Map<string, number>();

  for (const courtType of COURT_TYPES) {
    const record = await prisma.tipoCancha.upsert({
      where: { nombre: courtType.nombre },
      update: {},
      create: courtType,
    });

    courtTypeIds.set(courtType.nombre, record.id);
  }

  return courtTypeIds;
}

async function seedCourts(courtTypeIds: Map<string, number>): Promise<number[]> {
  const courtIds: number[] = [];

  for (const court of COURTS) {
    const tipoCanchaId = courtTypeIds.get(court.tipoCanchaNombre);

    if (!tipoCanchaId) {
      throw new Error(`No se encontró el tipo de cancha "${court.tipoCanchaNombre}".`);
    }

    const record = await prisma.cancha.upsert({
      where: { codigo: court.codigo },
      update: {},
      create: {
        codigo: court.codigo,
        nombre: court.nombre,
        descripcion: court.descripcion,
        precioHora: court.precioHora,
        capacidad: court.capacidad,
        ubicacion: court.ubicacion,
        imagen: court.imagen,
        tipoCanchaId,
      },
    });

    courtIds.push(record.id);
  }

  return courtIds;
}

async function seedSchedules(courtIds: number[]): Promise<number> {
  const schedules = courtIds.flatMap((canchaId) =>
    WEEK_DAYS.flatMap((diaSemana) =>
      SCHEDULE_SLOTS.map((slot) => ({
        canchaId,
        diaSemana,
        horaInicio: parseTimeString(slot.horaInicio),
        horaFin: parseTimeString(slot.horaFin),
      })),
    ),
  );

  const result = await prisma.horario.createMany({
    data: schedules,
    skipDuplicates: true,
  });

  return result.count;
}

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

  const courtTypeIds = await seedCourtTypes();
  const courtIds = await seedCourts(courtTypeIds);
  const schedulesCreated = await seedSchedules(courtIds);

  console.log('Seed completado:');
  console.log(`- Roles y usuario administrador listos`);
  console.log(`- ${COURT_TYPES.length} tipos de cancha`);
  console.log(`- ${COURTS.length} canchas`);
  console.log(`- ${schedulesCreated} horarios nuevos (${SCHEDULE_SLOTS.length} por día × ${WEEK_DAYS.length} días × ${courtIds.length} canchas)`);
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
