// src/components/SimulationPage.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Loader2, AlertCircle, CheckCircle, Clock, Shuffle } from 'lucide-react';
import { machineHoursApi, machineSettingsApi, MachineSettingsData } from '../lib/api';

interface FormData {
  logTime: string;
  machineName: string;
  runHour: string;
  stopHour: string;
  warningHour: string;
  runStatus: string;
  stopStatus: string;
  reworkStatus: string;
}

interface RecentEntry {
  id: number;
  logTime: string;
  machineName: string;
  runHour: number;
  stopHour: number;
  warningHour: number;
  runStatus: number;
  stopStatus: number;
}

const initialFormData: FormData = {
  logTime: new Date().toISOString().slice(0, 16),
  machineName: '',
  runHour: '0.5',
  stopHour: '0.1',
  warningHour: '0',
  runStatus: '1',
  stopStatus: '0',
  reworkStatus: '0',
};

// Format date to display string with seconds
const formatDateTime = (date: Date): string => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const SimulationPage = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [machines, setMachines] = useState<MachineSettingsData[]>([]);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState(new Date().toISOString().slice(0, 16));
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update current time every second
  useEffect(() => {
    timeIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  // Load machines list
  const loadMachines = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await machineSettingsApi.getAll();
      setMachines(data);
      if (data.length > 0 && !formData.machineName) {
        setFormData(prev => ({ ...prev, machineName: data[0].machineName }));
      }
    } catch (err) {
      setError('Failed to load machines');
    } finally {
      setIsLoading(false);
    }
  }, [formData.machineName]);

  // Load recent entries
  const loadRecentEntries = useCallback(async () => {
    try {
      const data = await machineHoursApi.getAll({ limit: 10 });
      setRecentEntries(data.map(d => ({
        id: d.id,
        logTime: d.logTime,
        machineName: d.machineName,
        runHour: d.runHour,
        stopHour: d.stopHour,
        warningHour: d.warningHour,
        runStatus: d.runStatus,
        stopStatus: d.stopStatus,
      })));
    } catch {
      // Silently fail for recent entries
    }
  }, []);

  useEffect(() => {
    loadMachines();
    loadRecentEntries();
  }, [loadMachines, loadRecentEntries]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Auto-toggle: Run and Stop status are mutually exclusive
    if (name === 'runStatus' && value === '1') {
      setFormData(prev => ({ ...prev, runStatus: '1', stopStatus: '0' }));
    } else if (name === 'stopStatus' && value === '1') {
      setFormData(prev => ({ ...prev, runStatus: '0', stopStatus: '1' }));
    } else if (name === 'runStatus' && value === '0') {
      setFormData(prev => ({ ...prev, runStatus: '0', stopStatus: '1' }));
    } else if (name === 'stopStatus' && value === '0') {
      setFormData(prev => ({ ...prev, runStatus: '1', stopStatus: '0' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError(null);
    setSuccess(null);
  };

  const handleRandomize = () => {
    const isRun = Math.random() > 0.5;
    const isRework = Math.random() > 0.7; // 30% chance of rework

    setFormData(prev => ({
      ...prev,
      runHour: Math.floor(Math.random() * 1001).toString(), // 0 - 1000
      stopHour: Math.floor(Math.random() * 1001).toString(), // 0 - 1000
      warningHour: '0', // always 0
      runStatus: isRun ? '1' : '0',
      stopStatus: isRun ? '0' : '1',
      reworkStatus: isRework ? '1' : '0',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.machineName) {
      setError('Please select a machine');
      return;
    }

    try {
      setIsSubmitting(true);
      const logTime = useCustomTime ? new Date(customTime).toISOString() : new Date().toISOString();
      await machineHoursApi.create({
        logTime,
        machineName: formData.machineName,
        runHour: parseFloat(formData.runHour) || 0,
        stopHour: parseFloat(formData.stopHour) || 0,
        warningHour: parseFloat(formData.warningHour) || 0,
        runStatus: parseInt(formData.runStatus) || 0,
        stopStatus: parseInt(formData.stopStatus) || 0,
        reworkStatus: formData.reworkStatus ? parseInt(formData.reworkStatus) : null,
      });

      setSuccess(`Added data for ${formData.machineName} successfully!`);

      // Reload recent entries
      await loadRecentEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (status: 'RUN' | 'STOP') => {
    if (!formData.machineName) {
      setError('Please select a machine');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const logTime = useCustomTime ? new Date(customTime).toISOString() : new Date().toISOString();
      await machineHoursApi.create({
        logTime,
        machineName: formData.machineName,
        runHour: status === 'RUN' ? 0.5 : 0,
        stopHour: status === 'STOP' ? 0.5 : 0,
        warningHour: 0,
        runStatus: status === 'RUN' ? 1 : 0,
        stopStatus: status === 'STOP' ? 1 : 0,
        reworkStatus: null,
      });

      setSuccess(`Quick added ${status} for ${formData.machineName}!`);
      await loadRecentEntries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add data');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Simulation Machine Monitoring
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Add test data to machine_hours table
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Add Machine Hours Data
          </h2>

          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700 dark:text-green-400">{success}</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Add (Current Time)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickAdd('RUN')}
                disabled={isSubmitting || !formData.machineName}
                className="flex-1 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                + RUN
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd('STOP')}
                disabled={isSubmitting || !formData.machineName}
                className="flex-1 px-4 py-2 bg-green-400 hover:bg-green-500 text-gray-900 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                + STOP
              </button>
              <button
                type="button"
                onClick={handleRandomize}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Machine Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Machine Name *
              </label>
              <select
                name="machineName"
                value={formData.machineName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Machine</option>
                {machines.map(m => (
                  <option key={m.id} value={m.machineName}>
                    {m.machineName} ({m.groupName})
                  </option>
                ))}
              </select>
            </div>

            {/* Log Time - Toggle between Current and Custom */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Log Time
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {useCustomTime ? 'Custom' : 'Current'}
                  </span>
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      useCustomTime ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    onClick={() => setUseCustomTime(!useCustomTime)}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        useCustomTime ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>
              </div>
              {useCustomTime ? (
                <input
                  type="datetime-local"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span className="font-mono">{formatDateTime(currentTime)}</span>
                </div>
              )}
            </div>

            {/* Run/Stop/Warning Hours */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Run Hour
                </label>
                <input
                  type="number"
                  name="runHour"
                  value={formData.runHour}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stop Hour
                </label>
                <input
                  type="number"
                  name="stopHour"
                  value={formData.stopHour}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Warning Hour
                </label>
                <input
                  type="number"
                  name="warningHour"
                  value={formData.warningHour}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Run/Stop Status Switch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Machine Status
              </label>
              <div className="flex items-center justify-center gap-4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className={`font-medium transition-colors ${formData.runStatus === '1' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}>
                  RUN
                </span>
                <div
                  className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors ${
                    formData.runStatus === '1' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  onClick={() => {
                    if (formData.runStatus === '1') {
                      setFormData(prev => ({ ...prev, runStatus: '0', stopStatus: '1' }));
                    } else {
                      setFormData(prev => ({ ...prev, runStatus: '1', stopStatus: '0' }));
                    }
                  }}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.runStatus === '1' ? 'translate-x-1' : 'translate-x-8'
                    }`}
                  />
                </div>
                <span className={`font-medium transition-colors ${formData.stopStatus === '1' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                  STOP
                </span>
              </div>
            </div>

            {/* Rework Status Switch */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rework Status
              </label>
              <div className="flex items-center justify-center gap-4 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className={`font-medium transition-colors ${formData.reworkStatus !== '1' ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}>
                  NO
                </span>
                <div
                  className={`relative w-14 h-7 rounded-full cursor-pointer transition-colors ${
                    formData.reworkStatus === '1' ? 'bg-red-500' : 'bg-gray-400'
                  }`}
                  onClick={() => {
                    if (formData.reworkStatus === '1') {
                      setFormData(prev => ({ ...prev, reworkStatus: '0' }));
                    } else {
                      setFormData(prev => ({ ...prev, reworkStatus: '1' }));
                    }
                  }}
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.reworkStatus === '1' ? 'translate-x-8' : 'translate-x-1'
                    }`}
                  />
                </div>
                <span className={`font-medium transition-colors ${formData.reworkStatus === '1' ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                  REWORK
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              Add Data
            </button>
          </form>
        </div>

        {/* Recent Entries Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Recent Entries (Last 10)
          </h2>

          {recentEntries.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No recent entries
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Time</th>
                    <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-400">Machine</th>
                    <th className="text-center py-2 px-2 text-gray-600 dark:text-gray-400">Run</th>
                    <th className="text-center py-2 px-2 text-gray-600 dark:text-gray-400">Stop</th>
                    <th className="text-center py-2 px-2 text-gray-600 dark:text-gray-400">Warn</th>
                    <th className="text-center py-2 px-2 text-gray-600 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-2 px-2 text-gray-700 dark:text-gray-300">
                        {new Date(entry.logTime).toLocaleString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2 px-2 text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                        {entry.machineName}
                      </td>
                      <td className="py-2 px-2 text-center text-gray-700 dark:text-gray-300">
                        {entry.runHour.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center text-gray-700 dark:text-gray-300">
                        {entry.stopHour.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center text-gray-700 dark:text-gray-300">
                        {entry.warningHour.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          entry.runStatus === 1
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-green-200 text-green-800'
                        }`}>
                          {entry.runStatus === 1 ? 'RUN' : 'STOP'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationPage;
