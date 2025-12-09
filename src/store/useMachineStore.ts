// src/store/useMachineStore.ts
import { create } from 'zustand';
import { Machine, TimelineData, DateRange } from '../types';
import { mockMachines, mockTimelineData } from '../data/mockData';
import { machineHoursApi, MachineHoursData } from '../lib/api';

// Helper to determine group from machine name
const getGroupFromMachineName = (name: string): string => {
  if (name.startsWith('Model') || name.startsWith('PIS') || name.startsWith('Side piece') || name.startsWith('NC Lathe')) {
    return 'PIS';
  }
  if (name.startsWith('3G')) {
    return '3G';
  }
  if (name.startsWith('Laser')) {
    return 'BLADE';
  }
  if (name.startsWith('Letter')) {
    return 'SIDE MOLD';
  }
  // SECTOR vs SECTOR (TR) - based on specific machine numbers
  if (name.startsWith('Machining') || name.startsWith('Turning')) {
    const num = parseInt(name.split(' ')[1]) || 0;
    // Machining 1, 7, 8 and Turning 4, 9 are SECTOR (TR)
    if (name.startsWith('Machining') && [1, 7, 8].includes(num)) {
      return 'SECTOR (TR)';
    }
    if (name.startsWith('Turning') && [4, 9].includes(num)) {
      return 'SECTOR (TR)';
    }
    // Machining 2, 5, 6 and Turning 5, 7 are SIDE MOLD
    if (name.startsWith('Machining') && [2, 5, 6].includes(num)) {
      return 'SIDE MOLD';
    }
    if (name.startsWith('Turning') && [5, 7].includes(num)) {
      return 'SIDE MOLD';
    }
    return 'SECTOR';
  }
  return 'OTHER';
};

// Convert API data to Machine type
const mapToMachine = (data: MachineHoursData): Machine => ({
  id: String(data.id),
  group: getGroupFromMachineName(data.machineName),
  machineName: data.machineName,
  state: data.runStatus === 1 ? 'RUN' : 'STOP',
  rework: data.reworkStatus !== null ? String(data.reworkStatus) : '',
  stopHours: data.stopHour,
  weeklyActualRatio: data.runHour * 100, // runHour is ratio (0-1)
  weeklyTargetRatio: 50, // default target
  monthlyActualRatio: 0, // ยังไม่มีข้อมูล - เว้นไว้ก่อน
  monthlyTargetRatio: 50, // default target
});

// Convert API data to TimelineData type
const mapToTimelineData = (data: MachineHoursData, dateRange: DateRange): TimelineData => {
  const runRatio = data.runHour * 100;
  const totalHours = data.runHour + data.stopHour;
  const runHours = totalHours > 0 ? (data.runHour / totalHours) * 24 : 0;
  const stopHours = totalHours > 0 ? (data.stopHour / totalHours) * 24 : 24;

  // Generate timeline segments based on current status
  const dayStart = new Date(dateRange.from);
  dayStart.setHours(0, 0, 0, 0);

  const timeline: import('../types').TimelineSegment[] = [];

  // Create a simple timeline representation
  if (runHours > 0) {
    timeline.push({
      start: dayStart,
      end: new Date(dayStart.getTime() + runHours * 60 * 60 * 1000),
      state: 'RUN',
      duration: runHours
    });
  }
  if (stopHours > 0) {
    const stopStart = new Date(dayStart.getTime() + runHours * 60 * 60 * 1000);
    timeline.push({
      start: stopStart,
      end: new Date(stopStart.getTime() + stopHours * 60 * 60 * 1000),
      state: 'STOP',
      duration: stopHours
    });
  }

  return {
    machineName: data.machineName,
    run: runHours,
    warning: 0,
    stop: stopHours,
    actualRatio1: runRatio,
    actualRatio2: 0, // ยังไม่มีข้อมูล
    trueRatio1: runRatio,
    trueRatio2: 50, // target
    warningRatio: 0,
    timeline
  };
};

interface MachineStore {
  // State
  machines: Machine[];
  timelineData: TimelineData[];
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
      // Fetch from API
      const data = await machineHoursApi.getAll({ limit: 1000 });

      // Get latest record for each machine
      const latestByMachine = new Map<string, MachineHoursData>();
      for (const entry of data) {
        const existing = latestByMachine.get(entry.machineName);
        if (!existing || new Date(entry.logTime) > new Date(existing.logTime)) {
          latestByMachine.set(entry.machineName, entry);
        }
      }

      // Convert to Machine type
      const machines = Array.from(latestByMachine.values()).map(mapToMachine);
      set({ machines, isLoading: false });
    } catch (error) {
      // Fallback to mock data in development when API is not available
      console.warn('API not available, using mock data:', error);
      set({ machines: mockMachines, isLoading: false });
    }
  },

  loadTimelineData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { dateRange } = get();

      // Fetch from API
      const data = await machineHoursApi.getAll({ limit: 1000 });

      // Get latest record for each machine
      const latestByMachine = new Map<string, MachineHoursData>();
      for (const entry of data) {
        const existing = latestByMachine.get(entry.machineName);
        if (!existing || new Date(entry.logTime) > new Date(existing.logTime)) {
          latestByMachine.set(entry.machineName, entry);
        }
      }

      // Convert to TimelineData type
      const timelineData = Array.from(latestByMachine.values()).map(d => mapToTimelineData(d, dateRange));
      set({ timelineData, isLoading: false });
    } catch (error) {
      // Fallback to mock data in development when API is not available
      console.warn('API not available, using mock data:', error);
      set({ timelineData: mockTimelineData, isLoading: false });
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
    const { machines } = get();

    if (machines.length === 0) {
      set({ error: 'No data to export' });
      return;
    }

    try {
      const headers = ['Group', 'Machine Name', 'State', 'Stop Hours', 'Weekly Actual', 'Weekly Target', 'Monthly Actual', 'Monthly Target'];
      const rows = machines.map(m => [
        escapeCSVValue(m.group),
        escapeCSVValue(m.machineName),
        escapeCSVValue(m.state),
        escapeCSVValue(m.stopHours.toFixed(2)),
        escapeCSVValue(m.weeklyActualRatio.toFixed(2)),
        escapeCSVValue(m.weeklyTargetRatio),
        escapeCSVValue(m.monthlyActualRatio.toFixed(2)),
        escapeCSVValue(m.monthlyTargetRatio)
      ]);

      // Add BOM for UTF-8 support
      const BOM = '\uFEFF';
      const csv = BOM + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `machine-data-${new Date().toISOString().split('T')[0]}.csv`;
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
