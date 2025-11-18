// src/data/mockData.ts
import { Machine, TimelineData, TimelineSegment, MachineState } from '../types';

const generateTimeline = (): TimelineSegment[] => {
  const segments: TimelineSegment[] = [];
  const states: MachineState[] = ['RUN', 'STOP', 'RUN', 'STOP', 'IDLE', 'RUN'];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  let currentTime = new Date(now);
  
  for (let i = 0; i < 8; i++) {
    const duration = Math.random() * 2 + 1; // 1-3 hours
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
  {
    id: '1',
    group: 'PIS',
    machineName: 'Model 1',
    state: 'STOP',
    rework: '',
    stopHours: 1614.52,
    weeklyActualRatio: 58.4,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 55.67,
    monthlyTargetRatio: 50
  },
  {
    id: '2',
    group: 'PIS',
    machineName: 'Model 2',
    state: 'STOP',
    rework: '',
    stopHours: 1614.53,
    weeklyActualRatio: 43.2,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 41.8,
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
    machineName: 'Model 5',
    state: 'STOP',
    rework: '',
    stopHours: 1025.88,
    weeklyActualRatio: 60.42,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 51.19,
    monthlyTargetRatio: 50
  },
  {
    id: '6',
    group: 'PIS',
    machineName: 'Model 6',
    state: 'RUN',
    rework: '',
    stopHours: 1057,
    weeklyActualRatio: 38.5,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 55.14,
    monthlyTargetRatio: 50
  },
  {
    id: '7',
    group: 'PIS',
    machineName: 'PIS Casting',
    state: 'RUN',
    rework: '',
    stopHours: 953.17,
    weeklyActualRatio: 46.27,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 46.27,
    monthlyTargetRatio: 50
  },
  {
    id: '8',
    group: 'PIS',
    machineName: 'Side piece 1',
    state: 'RUN',
    rework: '',
    stopHours: 422.09,
    weeklyActualRatio: 83.49,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 51.2,
    monthlyTargetRatio: 50
  },
  {
    id: '9',
    group: 'SECTOR',
    machineName: 'Turning 8',
    state: 'STOP',
    rework: '',
    stopHours: 581.4,
    weeklyActualRatio: 63.55,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 63.55,
    monthlyTargetRatio: 50
  },
  {
    id: '10',
    group: 'SECTOR',
    machineName: 'Machining 3',
    state: 'STOP',
    rework: '',
    stopHours: 1117.43,
    weeklyActualRatio: 32.5,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 35.8,
    monthlyTargetRatio: 50
  },
  {
    id: '11',
    group: 'SECTOR',
    machineName: 'Machining 4',
    state: 'STOP',
    rework: '',
    stopHours: 1284.83,
    weeklyActualRatio: 72.51,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 68.9,
    monthlyTargetRatio: 50
  },
  {
    id: '12',
    group: 'SECTOR',
    machineName: 'Machining 10',
    state: 'RUN',
    rework: '',
    stopHours: 957.63,
    weeklyActualRatio: 39.88,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 42.3,
    monthlyTargetRatio: 50
  },
  {
    id: '13',
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
    id: '14',
    group: 'SIDE MOLD',
    machineName: 'Machining 2',
    state: 'STOP',
    rework: '',
    stopHours: 1411.82,
    weeklyActualRatio: 28.3,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 31.5,
    monthlyTargetRatio: 50
  },
  {
    id: '15',
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
    id: '16',
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
    id: '17',
    group: 'SIDE MOLD',
    machineName: 'Letter 9',
    state: 'STOP',
    rework: '',
    stopHours: 1603.02,
    weeklyActualRatio: 33.7,
    weeklyTargetRatio: 50,
    monthlyActualRatio: 38.2,
    monthlyTargetRatio: 50
  },
  {
    id: '18',
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
    id: '19',
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

export const mockTimelineData: TimelineData[] = mockMachines.slice(0, 12).map(machine => ({
  machineName: machine.machineName,
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
