// src/store/useMachineStore.ts
import { create } from 'zustand';
import { Machine, TimelineData, DateRange, TimelineSegment } from '../types';
import { machineStatusApi, MachineStatusData, timelineApi, TimelineApiData, TimelineSegmentData } from '../lib/api';

// Convert joined data to Machine type
const mapStatusToMachine = (data: MachineStatusData): Machine => ({
  id: String(data.id),
  group: data.groupName,
  machineName: data.machineName,
  state: data.runStatus === 1 ? 'RUN' : 'STOP',
  rework: data.reworkStatus !== null ? String(data.reworkStatus) : '',
  runHours: data.runHour ?? 0,
  stopHours: data.stopHour ?? 0,
  weeklyActualRatio: data.weeklyActualRatio ?? 0,
  weeklyTargetRatio: data.weeklyTarget,
  monthlyActualRatio: data.monthlyActualRatio ?? 0,
  monthlyTargetRatio: data.monthlyTarget,
});

// Build timeline segments from individual machine_hours records
const buildTimelineSegments = (
  segments: TimelineSegmentData[],
  machineName: string
): TimelineSegment[] => {
  const machineSegments = segments.filter(s => s.machineName === machineName);
  const timeline: TimelineSegment[] = [];

  for (const segment of machineSegments) {
    const logTime = new Date(segment.logTime);

    // Add RUN or REWORK segment if runHour > 0
    // If reworkStatus === 1, show as REWORK instead of RUN
    if (segment.runHour > 0) {
      const runDuration = segment.runHour;
      const state = segment.reworkStatus === 1 ? 'REWORK' : 'RUN';
      timeline.push({
        start: logTime,
        end: new Date(logTime.getTime() + runDuration * 60 * 60 * 1000),
        state,
        duration: runDuration
      });
    }

    // Add STOP segment if stopHour > 0
    if (segment.stopHour > 0) {
      const stopStart = segment.runHour > 0
        ? new Date(logTime.getTime() + segment.runHour * 60 * 60 * 1000)
        : logTime;
      const stopDuration = segment.stopHour;
      timeline.push({
        start: stopStart,
        end: new Date(stopStart.getTime() + stopDuration * 60 * 60 * 1000),
        state: 'STOP',
        duration: stopDuration
      });
    }
  }

  // Sort by start time
  timeline.sort((a, b) => a.start.getTime() - b.start.getTime());

  return timeline;
};

// Convert API data to TimelineData type (with group averages calculated)
const mapToTimelineData = (
  data: TimelineApiData,
  groupAverages: Map<string, { avgActualRatio1: number; avgTrueRatio1: number }>,
  segments: TimelineSegmentData[]
): TimelineData => {
  const warningHours = data.warningHour || 0;

  // Get group averages
  const groupAvg = groupAverages.get(data.groupName) || { avgActualRatio1: 0, avgTrueRatio1: 0 };

  // Build timeline from actual segments data
  let timeline = buildTimelineSegments(segments, data.machineName);

  // Use aggregated RUN/STOP values from API
  const totalRun = data.runHour || 0;
  const totalStop = data.stopHour || 0;

  // If no detailed segments available, create a simple proportional timeline
  if (timeline.length === 0 && (totalRun > 0 || totalStop > 0)) {
    const now = new Date();
    if (totalRun > 0) {
      timeline.push({
        start: now,
        end: now,
        state: 'RUN',
        duration: totalRun
      });
    }
    if (totalStop > 0) {
      timeline.push({
        start: now,
        end: now,
        state: 'STOP',
        duration: totalStop
      });
    }
  }

  // Calculate Ratio 2 values (Group averages)
  const actualRatio2 = groupAvg.avgActualRatio1; // Group average of Actual Ratio 1
  const trueRatio2 = groupAvg.avgTrueRatio1;     // Group average of True Ratio 1

  // WARNING RATIO = ACTUAL RATIO 2 - TRUE RATIO 2
  const warningRatio = Number((actualRatio2 - trueRatio2).toFixed(2));

  return {
    machineName: data.machineName,
    groupName: data.groupName,
    run: totalRun,
    warning: warningHours,
    stop: totalStop,
    actualRatio1: data.actualRatio1,
    actualRatio2,
    trueRatio1: data.trueRatio1,
    trueRatio2,
    warningRatio,
    timeline
  };
};

interface MachineStore {
  // State
  machines: Machine[];
  timelineData: TimelineData[];
  availableGroups: string[];
  selectedGroup: string;
  dateRange: DateRange;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedGroup: (group: string) => void;
  setDateRange: (range: DateRange) => boolean;
  loadMachines: () => Promise<void>;
  loadTimelineData: () => Promise<void>;
  updateMachineTarget: (id: string, weeklyTarget: number, monthlyTarget: number) => void;
  exportToCSV: () => void;
  clearError: () => void;
}

// Helper to validate date range
const isValidDateRange = (from: Date, to: Date): boolean => {
  return from instanceof Date && to instanceof Date && !isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to;
};

// Helper to escape CSV values
const escapeCSVValue = (value: string | number): string => {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const useMachineStore = create<MachineStore>((set, get) => ({
  machines: [],
  timelineData: [],
  availableGroups: [],
  selectedGroup: 'ALL',
  dateRange: {
    from: new Date(new Date().setHours(0, 0, 0, 0)),
    to: new Date(new Date().setHours(23, 59, 59, 999))
  },
  isLoading: false,
  error: null,

  setSelectedGroup: (group) => set({ selectedGroup: group }),

  setDateRange: (range) => {
    if (!isValidDateRange(range.from, range.to)) {
      set({ error: 'Invalid date range: "From" date must be before "To" date' });
      return false;
    }
    set({ dateRange: range, error: null });
    return true;
  },

  loadMachines: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch joined data from API
      const { data, groups } = await machineStatusApi.getAll();

      // Convert to Machine type
      const machines = data.map(mapStatusToMachine);
      set({ machines, availableGroups: groups, isLoading: false });
    } catch (error) {
      console.error('Failed to load machines:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load machines from database',
        isLoading: false
      });
    }
  },

  loadTimelineData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { dateRange } = get();

      // Fetch both aggregated data and individual segments in parallel
      const [data, segments] = await Promise.all([
        timelineApi.getByDateRange(dateRange.from, dateRange.to),
        timelineApi.getSegments(dateRange.from, dateRange.to)
      ]);

      // Calculate group averages for actualRatio2 and trueRatio2
      const groupStats = new Map<string, { sumActual: number; sumTrue: number; count: number }>();
      for (const entry of data) {
        const existing = groupStats.get(entry.groupName) || { sumActual: 0, sumTrue: 0, count: 0 };
        groupStats.set(entry.groupName, {
          sumActual: existing.sumActual + entry.actualRatio1,
          sumTrue: existing.sumTrue + entry.trueRatio1,
          count: existing.count + 1
        });
      }

      // Convert to averages
      const groupAverages = new Map<string, { avgActualRatio1: number; avgTrueRatio1: number }>();
      for (const [group, stats] of groupStats) {
        groupAverages.set(group, {
          avgActualRatio1: stats.count > 0 ? Number((stats.sumActual / stats.count).toFixed(2)) : 0,
          avgTrueRatio1: stats.count > 0 ? Number((stats.sumTrue / stats.count).toFixed(2)) : 0
        });
      }

      // Convert to TimelineData type with group averages and real segments
      const timelineData = data.map(d => mapToTimelineData(d, groupAverages, segments));
      set({ timelineData, isLoading: false });
    } catch (error) {
      console.error('Failed to load timeline data:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load timeline data from database',
        isLoading: false
      });
    }
  },

  updateMachineTarget: (id, weeklyTarget, monthlyTarget) => {
    // Validate targets are within reasonable bounds
    if (weeklyTarget < 0 || weeklyTarget > 100 || monthlyTarget < 0 || monthlyTarget > 100) {
      set({ error: 'Target ratios must be between 0 and 100' });
      return;
    }

    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === id
          ? { ...m, weeklyTargetRatio: weeklyTarget, monthlyTargetRatio: monthlyTarget }
          : m
      ),
      error: null
    }));
  },

  exportToCSV: () => {
    const { timelineData } = get();

    if (timelineData.length === 0) {
      set({ error: 'No data to export' });
      return;
    }

    try {
      const headers = ['Group', 'Machine Name', 'RUN', 'WARNING', 'STOP', 'Actual Ratio 1', 'Actual Ratio 2', 'True Ratio 1', 'True Ratio 2', 'Warning Ratio'];
      const rows = timelineData.map(t => [
        escapeCSVValue(t.groupName),
        escapeCSVValue(t.machineName),
        escapeCSVValue(t.run.toFixed(2)),
        escapeCSVValue(t.warning),
        escapeCSVValue(t.stop.toFixed(2)),
        escapeCSVValue(t.actualRatio1.toFixed(2)),
        escapeCSVValue(t.actualRatio2.toFixed(2)),
        escapeCSVValue(t.trueRatio1.toFixed(2)),
        escapeCSVValue(t.trueRatio2.toFixed(2)),
        escapeCSVValue(t.warningRatio)
      ]);

      // Add BOM for UTF-8 support
      const BOM = '\uFEFF';
      const csv = BOM + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timeline-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      set({ error: 'Failed to export data' });
    }
  },

  clearError: () => set({ error: null })
}));

// Selector hooks for optimized re-renders
export const useFilteredMachines = () => {
  const machines = useMachineStore(state => state.machines);
  const selectedGroup = useMachineStore(state => state.selectedGroup);

  return selectedGroup === 'ALL'
    ? machines
    : machines.filter(m => m.group === selectedGroup);
};

export const useGroups = () => {
  const machines = useMachineStore(state => state.machines);
  return ['ALL', ...Array.from(new Set(machines.map(m => m.group)))];
};
