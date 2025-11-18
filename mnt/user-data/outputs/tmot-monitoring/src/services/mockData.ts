// services/mockData.ts
import { Machine, TimelineData, TimelineSegment } from '../types/machine';

// Mock machines data
export const mockMachines: Machine[] = [
  {
    id: '1',
    group: 'PIS',
    machineName: 'Model 1',
    state: 'STOP',
    rework: '',
    stopHours: 1614.52,
    weeklyActualRatio: 58.67,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 58.67,
    monthlyTargetRatio: 50
  },
  {
    id: '2',
    group: 'PIS',
    machineName: 'Model 2',
    state: 'STOP',
    rework: '',
    stopHours: 1614.53,
    weeklyActualRatio: 45.2,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 44.8,
    monthlyTargetRatio: 50
  },
  {
    id: '3',
    group: 'PIS',
    machineName: 'Model 3',
    state: 'RUN',
    rework: '',
    stopHours: 895.62,
    weeklyActualRatio: 64.9,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 58.67,
    monthlyTargetRatio: 50
  },
  {
    id: '4',
    group: 'PIS',
    machineName: 'Model 4',
    state: 'STOP',
    rework: '',
    stopHours: 1258.85,
    weeklyActualRatio: 14.5,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 30.56,
    monthlyTargetRatio: 50
  },
  {
    id: '5',
    group: 'PIS',
    machineName: 'PIS Casting',
    state: 'RUN',
    rework: '',
    stopHours: 953.17,
    weeklyActualRatio: 46.27,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 41,
    monthlyTargetRatio: 50
  },
  {
    id: '6',
    group: 'SECTOR',
    machineName: 'Machining 4',
    state: 'STOP',
    rework: '',
    stopHours: 1284.83,
    weeklyActualRatio: 72.51,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 70.2,
    monthlyTargetRatio: 50
  },
  {
    id: '7',
    group: 'SECTOR',
    machineName: 'Machining 10',
    state: 'RUN',
    rework: '',
    stopHours: 957.63,
    weeklyActualRatio: 39.88,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 42.1,
    monthlyTargetRatio: 50
  },
  {
    id: '8',
    group: 'SECTOR',
    machineName: 'Turning 2',
    state: 'RUN',
    rework: '',
    stopHours: 865.33,
    weeklyActualRatio: 51.9,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 53.2,
    monthlyTargetRatio: 50
  },
  {
    id: '9',
    group: 'SIDE MOLD',
    machineName: 'Letter 1',
    state: 'STOP',
    rework: '',
    stopHours: 524.57,
    weeklyActualRatio: 74.43,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 74.56,
    monthlyTargetRatio: 50
  },
  {
    id: '10',
    group: 'SIDE MOLD',
    machineName: 'Letter 4',
    state: 'RUN',
    rework: '',
    stopHours: 465.55,
    weeklyActualRatio: 80.53,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 62.23,
    monthlyTargetRatio: 50
  },
  {
    id: '11',
    group: 'BLADE',
    machineName: 'Laser 1',
    state: 'RUN',
    rework: '',
    stopHours: 1141.5,
    weeklyActualRatio: 100,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 82.06,
    monthlyTargetRatio: 50
  },
  {
    id: '12',
    group: 'BLADE',
    machineName: 'Laser 2',
    state: 'STOP',
    rework: '',
    stopHours: 1605.78,
    weeklyActualRatio: 29.41,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 35.8,
    monthlyTargetRatio: 50
  }
];

// Generate random timeline segments
const generateTimelineSegments = (): TimelineSegment[] => {
  const segments: TimelineSegment[] = [];
  const states: ('RUN' | 'STOP' | 'IDLE')[] = ['RUN', 'STOP', 'IDLE'];
  let currentHour = 0;
  const totalHours = 24;

  while (currentHour < totalHours) {
    const duration = Math.random() * 3 + 0.5; // 0.5 to 3.5 hours
    const remainingHours = totalHours - currentHour;
    const actualDuration = Math.min(duration, remainingHours);
    
    segments.push({
      start: `${String(Math.floor(currentHour)).padStart(2, '0')}:00`,
      end: `${String(Math.floor(currentHour + actualDuration)).padStart(2, '0')}:00`,
      status: states[Math.floor(Math.random() * states.length)],
      duration: actualDuration
    });

    currentHour += actualDuration;
  }

  return segments;
};

// Mock timeline data
export const mockTimelineData: TimelineData[] = [
  {
    machineName: 'Model 4',
    run: 2,
    warning: 0,
    stop: 14.5,
    actualRatio1: 14.5,
    actualRatio2: 30.56,
    trueRatio1: 14.5,
    trueRatio2: 30.56,
    warningRatio: 0,
    timeline: generateTimelineSegments()
  },
  {
    machineName: 'Model 5',
    run: 12,
    warning: 0,
    stop: 4.5,
    actualRatio1: 72.51,
    actualRatio2: 30.56,
    trueRatio1: 72.51,
    trueRatio2: 30.56,
    warningRatio: 0,
    timeline: generateTimelineSegments()
  },
  {
    machineName: 'Model 6',
    run: 6.6,
    warning: 0,
    stop: 9.9,
    actualRatio1: 39.88,
    actualRatio2: 30.56,
    trueRatio1: 39.88,
    trueRatio2: 30.56,
    warningRatio: 0,
    timeline: generateTimelineSegments()
  },
  {
    machineName: 'NC Lathe 1',
    run: 5.2,
    warning: 0,
    stop: 11.4,
    actualRatio1: 31.32,
    actualRatio2: 19,
    trueRatio1: 31.32,
    trueRatio2: 19,
    warningRatio: 0,
    timeline: generateTimelineSegments()
  },
  {
    machineName: 'PIS Casting',
    run: 7.7,
    warning: 0,
    stop: 8.9,
    actualRatio1: 46.27,
    actualRatio2: 46.27,
    trueRatio1: 46.27,
    trueRatio2: 46.27,
    warningRatio: 0,
    timeline: generateTimelineSegments()
  },
  {
    machineName: 'Side piece 1',
    run: 13.9,
    warning: 0,
    stop: 2.6,
    actualRatio1: 84.17,
    actualRatio2: 68.17,
    trueRatio1: 84.17,
    trueRatio2: 68.17,
    warningRatio: 0,
    timeline: generateTimelineSegments()
  }
];

// Simulate API delay
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
