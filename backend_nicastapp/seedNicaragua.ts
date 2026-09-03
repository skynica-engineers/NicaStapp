import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const nicaraguaData = [
  {
    departamento: 'Boaco',
    municipios: ['Boaco', 'Camoapa', 'San José de los Remates', 'San Lorenzo', 'Santa Lucía', 'Teustepe']
  },
  {
    departamento: 'Carazo',
    municipios: ['Diriamba', 'Dolores', 'El Rosario', 'Jinotepe', 'La Conquista', 'La Paz de Oriente', 'San Marcos', 'Santa Teresa']
  },
  {
    departamento: 'Chinandega',
    municipios: ['Chichigalpa', 'Chinandega', 'Cinco Pinos', 'Corinto', 'El Realejo', 'El Viejo', 'Posoltega', 'Puerto Morazán', 'San Francisco del Norte', 'San Pedro del Norte', 'Santo Tomás del Norte', 'Somotillo', 'Villanueva']
  },
  {
    departamento: 'Chontales',
    municipios: ['Acoyapa', 'Comalapa', 'Cuapa', 'El Coral', 'Juigalpa', 'La Libertad', 'San Pedro de Lóvago', 'Santo Domingo', 'Santo Tomás', 'Villa Sandino']
  },
  {
    departamento: 'Estelí',
    municipios: ['Condega', 'Estelí', 'La Trinidad', 'Pueblo Nuevo', 'San Juan de Limay', 'San Nicolás']
  },
  {
    departamento: 'Granada',
    municipios: ['Diriá', 'Diriomo', 'Granada', 'Nandaime']
  },
  {
    departamento: 'Jinotega',
    municipios: ['El Cúa', 'Jinotega', 'La Concordia', 'San José de Bocay', 'San Rafael del Norte', 'San Sebastián de Yalí', 'Santa María de Pantasma', 'Wiwilí de Jinotega']
  },
  {
    departamento: 'León',
    municipios: ['Achuapa', 'El Jicaral', 'El Sauce', 'La Paz Centro', 'León', 'Malpaisillo', 'Nagarote', 'Quezalguaque', 'Santa Rosa del Peñón', 'Telica']
  },
  {
    departamento: 'Madriz',
    municipios: ['Las Sabanas', 'Palacagüina', 'San José de Cusmapa', 'San Juan del Río Coco', 'San Lucas', 'Somoto', 'Telpaneca', 'Totogalpa', 'Yalagüina']
  },
  {
    departamento: 'Managua',
    municipios: ['Ciudad Sandino', 'El Crucero', 'Managua', 'Mateare', 'San Francisco Libre', 'San Rafael del Sur', 'Ticuantepe', 'Tipitapa', 'Villa El Carmen']
  },
  {
    departamento: 'Masaya',
    municipios: ['Catarina', 'La Concepción', 'Masatepe', 'Masaya', 'Nandasmo', 'Nindirí', 'Niquinohomo', 'San Juan de Oriente', 'Tisma']
  },
  {
    departamento: 'Matagalpa',
    municipios: ['Ciudad Darío', 'El Tuma - La Dalia', 'Esquipulas', 'Matagalpa', 'Matiguás', 'Muy Muy', 'Rancho Grande', 'Río Blanco', 'San Dionisio', 'San Isidro', 'San Ramón', 'Sébaco', 'Terrabona']
  },
  {
    departamento: 'Nueva Segovia',
    municipios: ['Ciudad Antigua', 'Dipilto', 'El Jícaro', 'Jalapa', 'Macuelizo', 'Mozonte', 'Murra', 'Ocotal', 'Quilalí', 'San Fernando', 'Santa María', 'Wiwilí de Nueva Segovia']
  },
  {
    departamento: 'Rivas',
    municipios: ['Altagracia', 'Belén', 'Buenos Aires', 'Cárdenas', 'Moyogalpa', 'Potosí', 'Rivas', 'San Jorge', 'San Juan del Sur', 'Tola']
  },
  {
    departamento: 'Río San Juan',
    municipios: ['El Almendro', 'El Castillo', 'Morrito', 'San Carlos', 'San Juan de Nicaragua', 'San Miguelito']
  },
  {
    departamento: 'Costa Caribe Norte',
    municipios: ['Bonanza', 'Mulukukú', 'Prinzapolka', 'Puerto Cabezas', 'Rosita', 'Waslala', 'Waspam']
  },
  {
    departamento: 'Costa Caribe Sur',
    municipios: ['Bluefields', 'Corn Island', 'Desembocadura de la Cruz de Río Grande', 'El Ayote', 'El Rama', 'El Tortuguero', 'Kukra Hill', 'La Cruz de Río Grande', 'Laguna de Perlas', 'Muelle de los Bueyes', 'Nueva Guinea', 'Paiwas']
  }
];

async function main() {
  console.log('Iniciando carga de Departamentos y Municipios...');
  
  try {
    for (const data of nicaraguaData) {
      // 1. Insert or get Departamento
      const depName = data.departamento;
      await prisma.$executeRaw`INSERT INTO departamentos (nombre) VALUES (${depName}) ON CONFLICT DO NOTHING`;
      
      const depResult: any[] = await prisma.$queryRaw`SELECT id FROM departamentos WHERE nombre = ${depName} LIMIT 1`;
      
      if (depResult.length > 0) {
        const depId = depResult[0].id;
        
        // 2. Insert Municipios
        for (const munName of data.municipios) {
          await prisma.$executeRaw`INSERT INTO municipios (departamento_id, nombre) VALUES (${depId}, ${munName}) ON CONFLICT DO NOTHING`;
        }
      }
    }
    console.log('¡Catálogo de Nicaragua guardado con éxito!');
  } catch (error) {
    console.error('Error poblando la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
