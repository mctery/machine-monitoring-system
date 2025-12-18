// src/types/index.ts - Consolidated type definitions

export type MachineState = 'STOP' | 'RUN' | 'IDLE' | 'REWORK';

export interface Machine {
  id: string;
  group: string;
  machineName: string;
  state: MachineState;
  rework: string;
  runHours: number;
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
  groupName: string;
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

export interface MachineSetup {
  group: string;
  machineName: string;
  weeklyTargetRatio: number;
  monthlyTargetRatio: number;
}

export interface ExportData {
  start: string;
  end: string;
  machine: string;
  runHours: number;
  warningHours: number;
  stopHours: number;
  actualRatio1: number;
  actualRatio2: number;
  trueRatio1: number;
  trueRatio2: number;
  warningRatio: number;
}
