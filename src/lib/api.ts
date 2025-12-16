// API utility for frontend to communicate with Prisma backend

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  count?: number;
  message?: string;
  error?: string;
}

// Machine hours data from database
interface MachineHoursData {
  id: number;
  logTime: string;
  machineName: string;
  runHour: number;
  stopHour: number;
  runStatus: number;
  stopStatus: number;
  reworkStatus: number | null;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected' | 'error';
  timestamp: string;
  error?: string;
}

// Machine settings data from database
export interface MachineSettingsData {
  id: number;
  machineName: string;
  groupName: string;
  weeklyTarget: number;
  monthlyTarget: number;
  createdAt?: string;
  updatedAt?: string;
}

// Machine status data (joined from machine_settings + machine_hours)
export interface MachineStatusData {
  id: number;
  machineName: string;
  groupName: string;
  weeklyTarget: number;
  monthlyTarget: number;
  runHour: number | null;
  stopHour: number | null;
  runStatus: number | null;
  stopStatus: number | null;
  reworkStatus: number | null;
  logTime: string | null;
  weeklyActualRatio: number;
  monthlyActualRatio: number;
}

// Timeline data from API (for timeline viewer)
export interface TimelineApiData {
  machineName: string;
  groupName: string;
  weeklyTarget: number;
  monthlyTarget: number;
  runHour: number;
  stopHour: number;
  actualRatio1: number;
  trueRatio1: number;
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Health check
export async function checkHealth(): Promise<HealthStatus> {
  const response = await fetchApi<HealthStatus>('/health');
  return response as unknown as HealthStatus;
}

// Machine Hours API
export const machineHoursApi = {
  // Get machine hours data
  async getAll(params?: {
    machine?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<MachineHoursData[]> {
    const queryParams = new URLSearchParams();
    if (params?.machine) queryParams.set('machine', params.machine);
    if (params?.from) queryParams.set('from', params.from);
    if (params?.to) queryParams.set('to', params.to);
    if (params?.limit) queryParams.set('limit', String(params.limit));

    const query = queryParams.toString() ? `?${queryParams}` : '';
    const response = await fetchApi<MachineHoursData[]>(`/machine-hours${query}`);
    return response.data || [];
  },

  // Get unique machine names
  async getMachineNames(): Promise<string[]> {
    const data = await this.getAll({ limit: 1000 });
    const names = [...new Set(data.map(d => d.machineName))];
    return names.sort();
  },

  // Get latest data for each machine
  async getLatestByMachine(): Promise<Map<string, MachineHoursData>> {
    const data = await this.getAll({ limit: 1000 });
    const latest = new Map<string, MachineHoursData>();

    for (const entry of data) {
      const existing = latest.get(entry.machineName);
      if (!existing || new Date(entry.logTime) > new Date(existing.logTime)) {
        latest.set(entry.machineName, entry);
      }
    }

    return latest;
  },

  // Create new entry
  async create(entry: Omit<MachineHoursData, 'id'>): Promise<MachineHoursData> {
    const response = await fetchApi<MachineHoursData>('/machine-hours', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return response.data!;
  },
};

// Machine Settings API
export const machineSettingsApi = {
  // Get all machine settings
  async getAll(group?: string): Promise<MachineSettingsData[]> {
    const query = group && group !== 'All' ? `?group=${encodeURIComponent(group)}` : '';
    const response = await fetchApi<MachineSettingsData[]>(`/machine-settings${query}`);
    return response.data || [];
  },

  // Get unique groups
  async getGroups(): Promise<string[]> {
    const data = await this.getAll();
    const groups = [...new Set(data.map(d => d.groupName))];
    return ['All', ...groups.sort()];
  },

  // Create new setting
  async create(setting: Omit<MachineSettingsData, 'id' | 'createdAt' | 'updatedAt'>): Promise<MachineSettingsData> {
    const response = await fetchApi<MachineSettingsData>('/machine-settings', {
      method: 'POST',
      body: JSON.stringify(setting),
    });
    return response.data!;
  },

  // Update setting
  async update(id: number, setting: Partial<Omit<MachineSettingsData, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    await fetchApi(`/machine-settings?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(setting),
    });
  },

  // Delete setting
  async delete(id: number): Promise<void> {
    await fetchApi(`/machine-settings?id=${id}`, {
      method: 'DELETE',
    });
  },

  // Initialize table and seed data
  async initialize(): Promise<{ message: string; insertedCount?: number }> {
    const response = await fetchApi<{ message: string; insertedCount?: number }>('/init-settings', {
      method: 'POST',
    });
    return response as { message: string; insertedCount?: number };
  },
};

// Machine Status API (joined data for monitoring page)
export const machineStatusApi = {
  // Get all machine status with settings and latest hours
  async getAll(): Promise<{ data: MachineStatusData[]; groups: string[] }> {
    const response = await fetchApi<MachineStatusData[]>('/machine-status');
    return {
      data: response.data || [],
      groups: (response as unknown as { groups: string[] }).groups || []
    };
  },
};

// Timeline API (for timeline viewer with date range filter)
export const timelineApi = {
  // Get timeline data with date range filter
  async getByDateRange(from: Date, to: Date): Promise<TimelineApiData[]> {
    const fromStr = from.toISOString();
    const toStr = to.toISOString();
    const response = await fetchApi<TimelineApiData[]>(`/timeline-data?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`);
    return response.data || [];
  },
};

// Seed API (for generating test data)
export const seedApi = {
  // Generate random machine_hours data
  async seedHours(): Promise<{ message: string; insertedCount: number }> {
    const response = await fetchApi<{ message: string; insertedCount: number }>('/seed-hours');
    return response as { message: string; insertedCount: number };
  },
};

export type { MachineHoursData, HealthStatus, ApiResponse };
