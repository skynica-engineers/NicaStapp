import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const municipios = await prisma.municipio.findMany({ take: 5 });
  
  for (const m of municipios) {
    // Check if community exists
    const comms = await prisma.comunidades.findMany({ where: { municipio_id: m.id } });
    if (comms.length === 0) {
      await prisma.comunidades.create({
        data: {
          nombre: `Comunidad Central ${m.nombre}`,
          municipio_id: m.id
        }
      });
      console.log(`Created dummy community for ${m.nombre}`);
    } else {
      console.log(`Communities already exist for ${m.nombre}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
