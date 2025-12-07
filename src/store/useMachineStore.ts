// src/store/useMachineStore.ts
import { create } from 'zustand';
import { Machine, TimelineData, DateRange } from '../types';
import { mockMachines, mockTimelineData } from '../data/mockData';

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ machines: mockMachines, isLoading: false });

      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/machines');
      // if (!response.ok) throw new Error('Failed to fetch machines');
      // const data = await response.json();
      // set({ machines: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load machines',
        isLoading: false
      });
    }
  },

  loadTimelineData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ timelineData: mockTimelineData, isLoading: false });

      // TODO: Replace with actual API call when backend is ready
      // const { dateRange } = get();
      // const response = await fetch(`/api/timeline?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`);
      // if (!response.ok) throw new Error('Failed to fetch timeline data');
      // const data = await response.json();
      // set({ timelineData: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load timeline data',
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
