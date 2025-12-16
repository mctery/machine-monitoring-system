// src/data/mockData.ts
import { Machine, TimelineData, TimelineSegment, MachineState } from '../types';

const generateTimeline = (): TimelineSegment[] => {
  const segments: TimelineSegment[] = [];
  const states: MachineState[] = ['RUN', 'STOP', 'RUN', 'STOP', 'IDLE', 'RUN'];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let currentTime = new Date(now);

  for (let i = 0; i < 8; i++) {
    const duration = Math.random() * 2 + 1;
    const state = states[Math.floor(Math.random() * states.length)];
    const start = new Date(currentTime);
    currentTime = new Date(currentTime.getTime() + duration * 60 * 60 * 1000);

    segments.push({
      start,
      end: currentTime,
      state,
      duration
    });
  }

  return segments;
};

export const mockMachines: Machine[] = [
  // PIS Group - Left Table
  { id: '1', group: 'PIS', machineName: 'Model 1', state: 'STOP', rework: '', stopHours: 1614.52, weeklyActualRatio: 0, weeklyTargetRatio: 50, monthlyActualRatio: 0, monthlyTargetRatio: 50 },
  { id: '2', group: 'PIS', machineName: 'Model 2', state: 'STOP', rework: '', stopHours: 1614.53, weeklyActualRatio: 0, weeklyTargetRatio: 50, monthlyActualRatio: 0, monthlyTargetRatio: 50 },
  { id: '3', group: 'PIS', machineName: 'Model 3', state: 'RUN', rework: '', stopHours: 895.52, weeklyActualRatio: 64.9, weeklyTargetRatio: 50, monthlyActualRatio: 56.67, monthlyTargetRatio: 50 },
  { id: '4', group: 'PIS', machineName: 'Model 4', state: 'RUN', rework: '', stopHours: 1255.65, weeklyActualRatio: 23.56, weeklyTargetRatio: 50, monthlyActualRatio: 38.88, monthlyTargetRatio: 50 },
  { id: '5', group: 'PIS', machineName: 'PIS Casting', state: 'RUN', rework: '', stopHours: 993.27, weeklyActualRatio: 46.39, weeklyTargetRatio: 50, monthlyActualRatio: 41, monthlyTargetRatio: 50 },
  { id: '6', group: 'PIS', machineName: 'Side piece 1', state: 'RUN', rework: '', stopHours: 922.02, weeklyActualRatio: 83.49, weeklyTargetRatio: 50, monthlyActualRatio: 35.97, monthlyTargetRatio: 50 },
  { id: '7', group: 'PIS', machineName: 'Side piece 2', state: 'STOP', rework: '', stopHours: 961.88, weeklyActualRatio: 80.07, weeklyTargetRatio: 50, monthlyActualRatio: 51.2, monthlyTargetRatio: 50 },
  { id: '8', group: 'PIS', machineName: 'Side piece 3', state: 'RUN', rework: '', stopHours: 807.27, weeklyActualRatio: 71.68, weeklyTargetRatio: 50, monthlyActualRatio: 48.02, monthlyTargetRatio: 50 },
  { id: '9', group: 'PIS', machineName: 'Side piece 4', state: 'STOP', rework: '', stopHours: 1602.65, weeklyActualRatio: 0, weeklyTargetRatio: 50, monthlyActualRatio: 0, monthlyTargetRatio: 50 },
  { id: '10', group: 'PIS', machineName: 'Side piece 5', state: 'STOP', rework: '', stopHours: 845.17, weeklyActualRatio: 80.18, weeklyTargetRatio: 50, monthlyActualRatio: 54.56, monthlyTargetRatio: 50 },
  { id: '11', group: 'PIS', machineName: 'Side piece 6', state: 'STOP', rework: '', stopHours: 1196, weeklyActualRatio: 59.08, weeklyTargetRatio: 50, monthlyActualRatio: 22, monthlyTargetRatio: 50 },
  { id: '12', group: 'PIS', machineName: 'Side piece 13', state: 'RUN', rework: '', stopHours: 594.85, weeklyActualRatio: 92.31, weeklyTargetRatio: 50, monthlyActualRatio: 63.55, monthlyTargetRatio: 50 },
  { id: '13', group: 'PIS', machineName: 'Side piece 14', state: 'RUN', rework: '', stopHours: 663.3, weeklyActualRatio: 85.47, weeklyTargetRatio: 50, monthlyActualRatio: 62.06, monthlyTargetRatio: 50 },
  { id: '14', group: 'PIS', machineName: 'Side piece 7', state: 'RUN', rework: '', stopHours: 770.32, weeklyActualRatio: 73.19, weeklyTargetRatio: 50, monthlyActualRatio: 52.85, monthlyTargetRatio: 50 },
  { id: '15', group: 'PIS', machineName: 'Side piece 8', state: 'STOP', rework: '', stopHours: 706.92, weeklyActualRatio: 64.97, weeklyTargetRatio: 50, monthlyActualRatio: 53.98, monthlyTargetRatio: 50 },
  { id: '16', group: 'PIS', machineName: 'Side piece 9', state: 'RUN', rework: '', stopHours: 745.87, weeklyActualRatio: 75.66, weeklyTargetRatio: 50, monthlyActualRatio: 48.37, monthlyTargetRatio: 50 },
  { id: '17', group: 'PIS', machineName: 'Side piece 10', state: 'RUN', rework: '', stopHours: 847.58, weeklyActualRatio: 28.69, weeklyTargetRatio: 50, monthlyActualRatio: 43.65, monthlyTargetRatio: 50 },
  { id: '18', group: 'PIS', machineName: 'Side piece 11', state: 'RUN', rework: '', stopHours: 690.45, weeklyActualRatio: 84.94, weeklyTargetRatio: 50, monthlyActualRatio: 60.38, monthlyTargetRatio: 50 },
  { id: '19', group: 'PIS', machineName: 'Side piece 12', state: 'RUN', rework: '', stopHours: 667.67, weeklyActualRatio: 82.01, weeklyTargetRatio: 50, monthlyActualRatio: 58.63, monthlyTargetRatio: 50 },
  { id: '20', group: 'PIS', machineName: 'NC Lathe 1', state: 'STOP', rework: '', stopHours: 1437.48, weeklyActualRatio: 26.86, weeklyTargetRatio: 50, monthlyActualRatio: 18.02, monthlyTargetRatio: 50 },
  { id: '21', group: 'PIS', machineName: 'NC Lathe 2', state: 'STOP', rework: '', stopHours: 1355.93, weeklyActualRatio: 33.69, weeklyTargetRatio: 50, monthlyActualRatio: 11.98, monthlyTargetRatio: 50 },
  { id: '22', group: 'PIS', machineName: 'NC Lathe 3', state: 'STOP', rework: '', stopHours: 1399.37, weeklyActualRatio: 18.79, weeklyTargetRatio: 50, monthlyActualRatio: 17.42, monthlyTargetRatio: 50 },
  { id: '23', group: 'PIS', machineName: 'NC Lathe 4', state: 'STOP', rework: '', stopHours: 1497.95, weeklyActualRatio: 17.76, weeklyTargetRatio: 50, monthlyActualRatio: 7.94, monthlyTargetRatio: 50 },
  { id: '24', group: 'PIS', machineName: 'NC Lathe 5', state: 'STOP', rework: '', stopHours: 1448.83, weeklyActualRatio: 14.31, weeklyTargetRatio: 50, monthlyActualRatio: 13.22, monthlyTargetRatio: 50 },
  { id: '25', group: 'PIS', machineName: 'Model 5', state: 'RUN', rework: '', stopHours: 1025.88, weeklyActualRatio: 60.42, weeklyTargetRatio: 50, monthlyActualRatio: 61.19, monthlyTargetRatio: 50 },
  { id: '26', group: 'PIS', machineName: 'Model 6', state: 'RUN', rework: '', stopHours: 1097, weeklyActualRatio: 49.22, weeklyTargetRatio: 50, monthlyActualRatio: 59.14, monthlyTargetRatio: 50 },
  { id: '27', group: '3G', machineName: '3G Laser 1', state: 'RUN', rework: '', stopHours: 1407.73, weeklyActualRatio: 29.47, weeklyTargetRatio: 50, monthlyActualRatio: 11.87, monthlyTargetRatio: 50 },
  { id: '28', group: '3G', machineName: '3G Laser 2', state: 'STOP', rework: '', stopHours: 1174.5, weeklyActualRatio: 42.13, weeklyTargetRatio: 50, monthlyActualRatio: 14.34, monthlyTargetRatio: 50 },
  { id: '29', group: '3G', machineName: '3G Laser 3', state: 'RUN', rework: '', stopHours: 1226.55, weeklyActualRatio: 34.98, weeklyTargetRatio: 50, monthlyActualRatio: 12, monthlyTargetRatio: 50 },

  // SECTOR Group - Right Table
  { id: '30', group: 'SECTOR', machineName: 'Turning 8', state: 'STOP', rework: '', stopHours: 981.4, weeklyActualRatio: 48.51, weeklyTargetRatio: 50, monthlyActualRatio: 31.95, monthlyTargetRatio: 50 },
  { id: '31', group: 'SECTOR', machineName: 'Machining 9', state: 'STOP', rework: '', stopHours: 1117.43, weeklyActualRatio: 10.69, weeklyTargetRatio: 50, monthlyActualRatio: 85.44, monthlyTargetRatio: 50 },
  { id: '32', group: 'SECTOR (TR)', machineName: 'Machining 1', state: 'STOP', rework: '', stopHours: 1603.13, weeklyActualRatio: 5.42, weeklyTargetRatio: 50, monthlyActualRatio: 3.19, monthlyTargetRatio: 50 },
  { id: '33', group: 'SECTOR (TR)', machineName: 'Machining 8', state: 'STOP', rework: '', stopHours: 1547.18, weeklyActualRatio: 8.61, weeklyTargetRatio: 50, monthlyActualRatio: 2.82, monthlyTargetRatio: 50 },
  { id: '34', group: 'SECTOR (TR)', machineName: 'Turning 4', state: 'STOP', rework: '', stopHours: 1468.68, weeklyActualRatio: 9, weeklyTargetRatio: 50, monthlyActualRatio: 4.94, monthlyTargetRatio: 50 },
  { id: '35', group: 'SECTOR (TR)', machineName: 'Turning 9', state: 'STOP', rework: '', stopHours: 1342.6, weeklyActualRatio: 10.23, weeklyTargetRatio: 50, monthlyActualRatio: 14.83, monthlyTargetRatio: 50 },
  { id: '36', group: 'SECTOR (TR)', machineName: 'Machining 7', state: 'STOP', rework: '', stopHours: 1614.53, weeklyActualRatio: 0, weeklyTargetRatio: 50, monthlyActualRatio: 0, monthlyTargetRatio: 50 },
  { id: '37', group: 'SECTOR', machineName: 'Machining 3', state: 'STOP', rework: '', stopHours: 1198.33, weeklyActualRatio: 12.8, weeklyTargetRatio: 50, monthlyActualRatio: 77.67, monthlyTargetRatio: 50 },
  { id: '38', group: 'SECTOR', machineName: 'Machining 4', state: 'STOP', rework: '', stopHours: 1284.83, weeklyActualRatio: 18.17, weeklyTargetRatio: 50, monthlyActualRatio: 24.7, monthlyTargetRatio: 50 },
  { id: '39', group: 'SECTOR', machineName: 'Machining 10', state: 'RUN', rework: '', stopHours: 957.63, weeklyActualRatio: 40.23, weeklyTargetRatio: 50, monthlyActualRatio: 38.09, monthlyTargetRatio: 50 },
  { id: '40', group: 'SECTOR', machineName: 'Turning 1', state: 'STOP', rework: '', stopHours: 1484.17, weeklyActualRatio: 41.08, weeklyTargetRatio: 50, monthlyActualRatio: 14.09, monthlyTargetRatio: 50 },
  { id: '41', group: 'SECTOR', machineName: 'Turning 2', state: 'RUN', rework: '', stopHours: 865.33, weeklyActualRatio: 53.9, weeklyTargetRatio: 50, monthlyActualRatio: 47.63, monthlyTargetRatio: 50 },
  { id: '42', group: 'SECTOR', machineName: 'Turning 3', state: 'RUN', rework: '', stopHours: 877, weeklyActualRatio: 48.87, weeklyTargetRatio: 50, monthlyActualRatio: 41.89, monthlyTargetRatio: 50 },

  // SIDE MOLD Group - Right Table
  { id: '43', group: 'SIDE MOLD', machineName: 'Machining 2', state: 'STOP', rework: '', stopHours: 1411.82, weeklyActualRatio: 19.23, weeklyTargetRatio: 50, monthlyActualRatio: 14.46, monthlyTargetRatio: 50 },
  { id: '44', group: 'SIDE MOLD', machineName: 'Machining 5', state: 'STOP', rework: '', stopHours: 1155.48, weeklyActualRatio: 13.33, weeklyTargetRatio: 50, monthlyActualRatio: 28.79, monthlyTargetRatio: 50 },
  { id: '45', group: 'SIDE MOLD', machineName: 'Machining 6', state: 'RUN', rework: '', stopHours: 1171.27, weeklyActualRatio: 1.6, weeklyTargetRatio: 50, monthlyActualRatio: 25.86, monthlyTargetRatio: 50 },
  { id: '46', group: 'SIDE MOLD', machineName: 'Turning 5', state: 'RUN', rework: '', stopHours: 955.8, weeklyActualRatio: 45.85, weeklyTargetRatio: 50, monthlyActualRatio: 36.29, monthlyTargetRatio: 50 },
  { id: '47', group: 'SIDE MOLD', machineName: 'Turning 7', state: 'RUN', rework: '', stopHours: 1351.02, weeklyActualRatio: 13.86, weeklyTargetRatio: 50, monthlyActualRatio: 17.52, monthlyTargetRatio: 50 },
  { id: '48', group: 'SIDE MOLD', machineName: 'Letter 1', state: 'STOP', rework: '', stopHours: 354.57, weeklyActualRatio: 74.43, weeklyTargetRatio: 50, monthlyActualRatio: 74.56, monthlyTargetRatio: 50 },
  { id: '49', group: 'SIDE MOLD', machineName: 'Letter 2', state: 'RUN', rework: '', stopHours: 427.92, weeklyActualRatio: 91.43, weeklyTargetRatio: 50, monthlyActualRatio: 67.77, monthlyTargetRatio: 50 },
  { id: '50', group: 'SIDE MOLD', machineName: 'Letter 3', state: 'RUN', rework: '', stopHours: 828.3, weeklyActualRatio: 95.94, weeklyTargetRatio: 50, monthlyActualRatio: 72.83, monthlyTargetRatio: 50 },
  { id: '51', group: 'SIDE MOLD', machineName: 'Letter 4', state: 'RUN', rework: '', stopHours: 465.55, weeklyActualRatio: 48.88, weeklyTargetRatio: 50, monthlyActualRatio: 62.23, monthlyTargetRatio: 50 },
  { id: '52', group: 'SIDE MOLD', machineName: 'Letter 5', state: 'RUN', rework: '', stopHours: 483.12, weeklyActualRatio: 80.53, weeklyTargetRatio: 50, monthlyActualRatio: 60.61, monthlyTargetRatio: 50 },
  { id: '53', group: 'SIDE MOLD', machineName: 'Letter 6', state: 'RUN', rework: '', stopHours: 469.52, weeklyActualRatio: 97.18, weeklyTargetRatio: 50, monthlyActualRatio: 68.51, monthlyTargetRatio: 50 },
  { id: '54', group: 'SIDE MOLD', machineName: 'Letter 7', state: 'RUN', rework: '', stopHours: 467.8, weeklyActualRatio: 91.18, weeklyTargetRatio: 50, monthlyActualRatio: 59.87, monthlyTargetRatio: 50 },
  { id: '55', group: 'SIDE MOLD', machineName: 'Letter 8', state: 'STOP', rework: '', stopHours: 522.62, weeklyActualRatio: 43.39, weeklyTargetRatio: 50, monthlyActualRatio: 61.85, monthlyTargetRatio: 50 },
  { id: '56', group: 'SIDE MOLD', machineName: 'Letter 9', state: 'STOP', rework: '', stopHours: 1603.02, weeklyActualRatio: 8.02, weeklyTargetRatio: 50, monthlyActualRatio: 0.8, monthlyTargetRatio: 50 },
  { id: '57', group: 'SIDE MOLD', machineName: 'Letter 10', state: 'STOP', rework: '', stopHours: 395.85, weeklyActualRatio: 51.43, weeklyTargetRatio: 50, monthlyActualRatio: 67.74, monthlyTargetRatio: 50 },
  { id: '58', group: 'SIDE MOLD', machineName: 'Letter 11', state: 'RUN', rework: '', stopHours: 409.78, weeklyActualRatio: 80.71, weeklyTargetRatio: 50, monthlyActualRatio: 68.24, monthlyTargetRatio: 50 },

  // BLADE Group - Right Table
  { id: '59', group: 'BLADE', machineName: 'Laser 1', state: 'RUN', rework: '', stopHours: 1141.9, weeklyActualRatio: 100, weeklyTargetRatio: 50, monthlyActualRatio: 82.06, monthlyTargetRatio: 50 },
  { id: '60', group: 'BLADE', machineName: 'Laser 2', state: 'STOP', rework: '', stopHours: 1605.78, weeklyActualRatio: 0, weeklyTargetRatio: 50, monthlyActualRatio: 0, monthlyTargetRatio: 50 },
];

export const mockTimelineData: TimelineData[] = mockMachines.slice(0, 12).map(machine => ({
  machineName: machine.machineName,
  groupName: machine.group,
  run: Math.random() * 10 + 2,
  warning: Math.floor(Math.random() * 3),
  stop: Math.random() * 8 + 1,
  actualRatio1: machine.weeklyActualRatio,
  actualRatio2: machine.monthlyActualRatio,
  trueRatio1: machine.weeklyActualRatio,
  trueRatio2: machine.weeklyTargetRatio,
  warningRatio: 0,
  timeline: generateTimeline()
}));
