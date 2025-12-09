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

export type { MachineHoursData, HealthStatus, ApiResponse };
