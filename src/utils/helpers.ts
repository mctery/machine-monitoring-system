// src/utils/helpers.ts
import { MachineState } from '../types';

export const getStateColor = (state: MachineState): string => {
  switch (state) {
    case 'STOP':
      return 'bg-green-400 text-gray-900';
    case 'RUN':
      return 'bg-yellow-300 text-gray-900';
    case 'IDLE':
      return 'bg-gray-300 text-gray-900';
  }
};

export const getRatioColor = (actual: number, target: number): string => {
  const percentage = (actual / target) * 100;
  
  if (percentage >= 80) return 'bg-white';
  if (percentage >= 50) return 'bg-yellow-100';
  return 'bg-red-300 text-white';
};

export const getTimelineColor = (state: MachineState): string => {
  switch (state) {
    case 'RUN':
      return 'bg-green-500';
    case 'STOP':
      return 'bg-yellow-500';
    case 'IDLE':
      return 'bg-cyan-400';
  }
};

export const formatHours = (hours: number): string => {
  return hours.toFixed(2);
};

export const formatRatio = (ratio: number): string => {
  return ratio.toFixed(2);
};

export const getStatusIndicatorColor = (actual: number, target: number): string => {
  const ratio = actual / target;
  if (ratio >= 0.8) return 'bg-green-500';
  if (ratio >= 0.5) return 'bg-yellow-500';
  return 'bg-red-500';
};
