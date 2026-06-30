import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"
import { config } from "dotenv"
config({ path: ".env.local" })

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Sembrando base de datos...")

  // Organización
  const org = await prisma.organization.upsert({
    where: { code: "PALERMO" },
    update: {},
    create: {
      name: "Puerto de Palermo — Ingecol",
      code: "PALERMO",
    },
  })

  // Usuarios
  const adminHash = await bcrypt.hash("admin123", 12)
  const coordHash = await bcrypt.hash("coord123", 12)
  const supervisorHash = await bcrypt.hash("super123", 12)
  const clientHash = await bcrypt.hash("cliente123", 12)

  await prisma.user.upsert({
    where: { email: "admin@portops.co" },
    update: {},
    create: {
      email: "admin@portops.co",
      name: "Administrador",
      passwordHash: adminHash,
      role: "ADMIN",
      organizationId: org.id,
    },
  })

  await prisma.user.upsert({
    where: { email: "coordinador@portops.co" },
    update: {},
    create: {
      email: "coordinador@portops.co",
      name: "Carlos Coordinador",
      passwordHash: coordHash,
      role: "COORDINATOR",
      organizationId: org.id,
    },
  })

  await prisma.user.upsert({
    where: { email: "supervisor@portops.co" },
    update: {},
    create: {
      email: "supervisor@portops.co",
      name: "Ana Supervisora",
      passwordHash: supervisorHash,
      role: "FIELD_SUPERVISOR",
      organizationId: org.id,
    },
  })

  await prisma.user.upsert({
    where: { email: "cliente@empresa.co" },
    update: {},
    create: {
      email: "cliente@empresa.co",
      name: "Cliente Demo",
      passwordHash: clientHash,
      role: "CLIENT",
      organizationId: org.id,
    },
  })

  // Barcos (incluye los reales de los documentos de contexto)
  await prisma.ship.createMany({
    skipDuplicates: true,
    data: [
      { name: "MN MAYFLOWER",       imo: "9801234", flag: "Liberia",  organizationId: org.id },
      { name: "MN CRIMSON GARNET",  imo: "9805678", flag: "Marshall Islands", organizationId: org.id },
      { name: "MV Esperanza",       imo: "9123456", flag: "Panama",   organizationId: org.id },
      { name: "MV Caribe Star",     imo: "9234567", flag: "Bahamas",  organizationId: org.id },
      { name: "MV Pacífico",        imo: "9345678", flag: "Colombia", organizationId: org.id },
    ],
  })

  console.log("Listo. Usuarios creados:")
  console.log("  admin@portops.co         / admin123")
  console.log("  coordinador@portops.co   / coord123")
  console.log("  supervisor@portops.co    / super123")
  console.log("  cliente@empresa.co       / cliente123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
