// src/store/useMachineStore.ts
import { create } from 'zustand';
import { Machine, TimelineData, DateRange } from '../types';
import { mockMachines, mockTimelineData } from '../data/mockData';

interface MachineStore {
  machines: Machine[];
  timelineData: TimelineData[];
  selectedGroup: string;
  dateRange: DateRange;
  isLoading: boolean;
  
  setSelectedGroup: (group: string) => void;
  setDateRange: (range: DateRange) => void;
  loadMachines: () => void;
  loadTimelineData: () => void;
  updateMachineTarget: (id: string, weeklyTarget: number, monthlyTarget: number) => void;
  exportToCSV: () => void;
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
  
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  
  setDateRange: (range) => set({ dateRange: range }),
  
  loadMachines: () => {
    set({ isLoading: true });
    // Simulate API call
    setTimeout(() => {
      set({ machines: mockMachines, isLoading: false });
    }, 300);
  },
  
  loadTimelineData: () => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ timelineData: mockTimelineData, isLoading: false });
    }, 300);
  },
  
  updateMachineTarget: (id, weeklyTarget, monthlyTarget) => {
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === id
          ? { ...m, weeklyTargetRatio: weeklyTarget, monthlyTargetRatio: monthlyTarget }
          : m
      )
    }));
  },
  
  exportToCSV: () => {
    const { machines } = get();
    const headers = ['Group', 'Machine Name', 'State', 'Stop Hours', 'Weekly Actual', 'Weekly Target', 'Monthly Actual', 'Monthly Target'];
    const rows = machines.map(m => [
      m.group,
      m.machineName,
      m.state,
      m.stopHours.toFixed(2),
      m.weeklyActualRatio.toFixed(2),
      m.weeklyTargetRatio,
      m.monthlyActualRatio.toFixed(2),
      m.monthlyTargetRatio
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `machine-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}));
