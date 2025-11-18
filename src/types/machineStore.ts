// store/machineStore.ts
import { create } from 'zustand';
import { Machine, TimelineData, MachineSetup, DateRange } from '../types/machine';

interface MachineStore {
  machines: Machine[];
  timelineData: TimelineData[];
  selectedGroup: string;
  dateRange: DateRange;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setMachines: (machines: Machine[]) => void;
  setTimelineData: (data: TimelineData[]) => void;
  setSelectedGroup: (group: string) => void;
  setDateRange: (range: DateRange) => void;
  updateMachineSetup: (setup: MachineSetup) => void;
  fetchMachines: () => Promise<void>;
  fetchTimelineData: (from: string, to: string) => Promise<void>;
  exportData: () => Promise<void>;
}

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

  setMachines: (machines) => set({ machines }),
  
  setTimelineData: (data) => set({ timelineData: data }),
  
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  
  setDateRange: (range) => set({ dateRange: range }),
  
  updateMachineSetup: (setup) => {
    const { machines } = get();
    const updatedMachines = machines.map((m) =>
      m.group === setup.group && m.machineName === setup.machineName
        ? {
            ...m,
            weeklyTargetRatio: setup.weeklyTargetRatio,
            monthlyTargetRatio: setup.monthlyTargetRatio
          }
        : m
    );
    set({ machines: updatedMachines });
  },

  fetchMachines: async () => {
    set({ isLoading: true, error: null });
    try {
      // Use mock data for development
      const { mockMachines, delay } = await import('../services/mockData');
      await delay(500);
      set({ machines: mockMachines, isLoading: false });
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch('/api/machines');
      // const data = await response.json();
      // set({ machines: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch machines',
        isLoading: false 
      });
    }
  },

  fetchTimelineData: async (from, to) => {
    set({ isLoading: true, error: null });
    try {
      // Use mock data for development
      const { mockTimelineData, delay } = await import('../services/mockData');
      await delay(500);
      set({ timelineData: mockTimelineData, isLoading: false });
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await fetch(`/api/timeline?from=${from}&to=${to}`);
      // const data = await response.json();
      // set({ timelineData: data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch timeline data',
        isLoading: false 
      });
    }
  },

  exportData: async () => {
    try {
      const { dateRange } = get();
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dateRange)
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `machine-data-${dateRange.from.toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to export data'
      });
    }
  }
}));
