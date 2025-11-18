// src/types/index.ts

export type MachineState = 'STOP' | 'RUN' | 'IDLE';

export interface Machine {
  id: string;
  group: string;
  machineName: string;
  state: MachineState;
  rework: string;
  stopHours: number;
  weeklyActualRatio: number;
  weeklyTargetRatio: number;
  monthlyActualRatio: number;
  monthlyTargetRatio: number;
}

export interface TimelineSegment {
  start: Date;
  end: Date;
  state: MachineState;
  duration: number;
}

export interface TimelineData {
  machineName: string;
  run: number;
  warning: number;
  stop: number;
  actualRatio1: number;
  actualRatio2: number;
  trueRatio1: number;
  trueRatio2: number;
  warningRatio: number;
  timeline: TimelineSegment[];
}

export interface DateRange {
  from: Date;
  to: Date;
}
