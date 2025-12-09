import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// Random rework value: 0, 1, or null
const getRandomRework = (): number | null => {
  const values = [0, 1, null];
  return values[Math.floor(Math.random() * values.length)];
};

// 60 machines from screenshot
const seedData = [
  // PIS Group
  { logTime: '2025-12-09 23:00:00', machineName: 'Model 1', runHour: 0, stopHour: 1614.52, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Model 2', runHour: 0, stopHour: 1614.53, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Model 3', runHour: 0.65, stopHour: 895.52, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Model 4', runHour: 0.34, stopHour: 1255.65, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'PIS Casting', runHour: 0.46, stopHour: 993.27, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 1', runHour: 0.83, stopHour: 922.02, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 2', runHour: 0, stopHour: 961.88, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 3', runHour: 0.72, stopHour: 807.27, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 4', runHour: 0, stopHour: 1602.65, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 5', runHour: 0, stopHour: 845.17, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 6', runHour: 0, stopHour: 1196, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 13', runHour: 0.92, stopHour: 594.85, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 14', runHour: 0.85, stopHour: 663.3, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 7', runHour: 0.73, stopHour: 770.32, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 8', runHour: 0, stopHour: 706.92, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 9', runHour: 0.76, stopHour: 745.87, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 10', runHour: 0.29, stopHour: 847.58, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 11', runHour: 0.85, stopHour: 690.45, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Side piece 12', runHour: 0.82, stopHour: 667.67, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'NC Lathe 1', runHour: 0, stopHour: 1437.48, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'NC Lathe 2', runHour: 0, stopHour: 1355.93, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'NC Lathe 3', runHour: 0, stopHour: 1399.37, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'NC Lathe 4', runHour: 0, stopHour: 1497.95, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'NC Lathe 5', runHour: 0, stopHour: 1448.83, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Model 5', runHour: 0.60, stopHour: 1025.88, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Model 6', runHour: 0.49, stopHour: 1097, runStatus: 1, stopStatus: 0, reworkStatus: null },
  // 3G Group
  { logTime: '2025-12-09 23:00:00', machineName: '3G Laser 1', runHour: 0.28, stopHour: 1407.73, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: '3G Laser 2', runHour: 0, stopHour: 1174.5, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: '3G Laser 3', runHour: 0.34, stopHour: 1226.55, runStatus: 1, stopStatus: 0, reworkStatus: null },
  // SECTOR Group
  { logTime: '2025-12-09 23:00:00', machineName: 'Turning 8', runHour: 0, stopHour: 981.4, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Machining 9', runHour: 0, stopHour: 1117.43, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Machining 1', runHour: 0, stopHour: 1603.13, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Machining 8', runHour: 0, stopHour: 1547.18, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Turning 4', runHour: 0, stopHour: 1468.68, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Turning 9', runHour: 0, stopHour: 1342.6, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Machining 7', runHour: 0, stopHour: 1614.53, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Machining 3', runHour: 0, stopHour: 1198.33, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Machining 4', runHour: 0, stopHour: 1284.83, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Machining 10', runHour: 0.40, stopHour: 957.63, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Turning 1', runHour: 0, stopHour: 1484.17, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Turning 2', runHour: 0.54, stopHour: 865.33, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Turning 3', runHour: 0.49, stopHour: 877, runStatus: 1, stopStatus: 0, reworkStatus: null },
  // SIDE MOLD Group
  { logTime: '2025-12-09 23:00:00', machineName: 'Machining 2', runHour: 0, stopHour: 1411.82, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Machining 5', runHour: 0, stopHour: 1155.48, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Machining 6', runHour: 0.04, stopHour: 1171.27, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Turning 5', runHour: 0.46, stopHour: 955.8, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Turning 7', runHour: 0.14, stopHour: 1351.02, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 1', runHour: 0, stopHour: 354.57, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 2', runHour: 0.91, stopHour: 427.92, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 3', runHour: 0.96, stopHour: 828.3, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 4', runHour: 0.45, stopHour: 465.55, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 5', runHour: 0.81, stopHour: 483.12, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 6', runHour: 0.97, stopHour: 469.52, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 7', runHour: 0.91, stopHour: 467.8, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 8', runHour: 0, stopHour: 522.62, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 9', runHour: 0, stopHour: 1603.02, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 10', runHour: 0, stopHour: 395.83, runStatus: 0, stopStatus: 1, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Letter 11', runHour: 0.81, stopHour: 409.78, runStatus: 1, stopStatus: 0, reworkStatus: null },
  // BLADE Group
  { logTime: '2025-12-09 23:00:00', machineName: 'Laser 1', runHour: 1.00, stopHour: 1141.9, runStatus: 1, stopStatus: 0, reworkStatus: null },
  { logTime: '2025-12-09 23:00:00', machineName: 'Laser 2', runHour: 0, stopHour: 1605.78, runStatus: 0, stopStatus: 1, reworkStatus: null },
];

async function main() {
  console.log('Seeding database with 60 machines...');

  for (const data of seedData) {
    const reworkStatus = getRandomRework();
    await prisma.machineHours.create({
      data: {
        logTime: new Date(data.logTime),
        machineName: data.machineName,
        runHour: data.runHour,
        stopHour: data.stopHour,
        runStatus: data.runStatus,
        stopStatus: data.stopStatus,
        reworkStatus: reworkStatus,
      },
    });
  }

  console.log(`Seeded ${seedData.length} records with random rework values (0, 1, null)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
