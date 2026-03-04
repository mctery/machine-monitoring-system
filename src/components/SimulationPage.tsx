// src/components/SimulationPage.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle, Clock, Shuffle, Calendar, Play, Trash2, Eye, Zap, SearchSlash } from 'lucide-react';
import { machineHoursApi, machineSettingsApi, MachineSettingsData, MachineHoursData } from '../lib/api';
import PageTransition, { fadeInUp, staggerContainer, AnimatePresence } from './PageTransition';
import ConfirmModal from './ConfirmModal';

// --- Types ---

interface BatchEntry {
  logTime: Date;
  machineName: string;
  runHour: number;
  stopHour: number;
  runStatus: number;
  stopStatus: number;
  reworkStatus: number | null;
}

interface BatchConfig {
  fromDate: string;
  toDate: string;
  interval: number;
  intervalUnit: 'seconds' | 'minutes' | 'hours';
  allMachines: boolean;
  fillGaps: boolean;
  randomGaps: boolean;
  gapPercent: number; // 0-100, percentage of slots to skip
}

type Message = { type: 'error' | 'success'; text: string } | null;
type ActiveTab = 'quick' | 'batch';

// --- Helpers ---

// Format Date to datetime-local input value (local time, not UTC)
const toDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateTime = (date: Date): string =>
  date.toLocaleString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  });

const formatShortDate = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });

const generateRandomEntry = (logTime: Date, machineName: string): BatchEntry => {
  const isRun = Math.random() > 0.5;
  const isRework = Math.random() > 0.7;
  const hourValue = Math.floor(Math.random() * 1001);
  return {
    logTime, machineName,
    runHour: isRun ? hourValue : 0,
    stopHour: isRun ? 0 : hourValue,
    runStatus: isRun ? 1 : 0,
    stopStatus: isRun ? 0 : 1,
    reworkStatus: isRework ? 1 : null,
  };
};

const StatusBadge = ({ run, rework }: { run: number; rework?: number | null }) => {
  const isRework = rework === 1;
  const isRun = run === 1;
  const cls = isRework
    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    : isRun
    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  const label = isRework ? 'REWORK' : isRun ? 'RUN' : 'STOP';
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>{label}</span>;
};

// --- Component ---

const SimulationPage = () => {
  // Shared state
  const [machines, setMachines] = useState<MachineSettingsData[]>([]);
  const [machineName, setMachineName] = useState('');
  const [recentEntries, setRecentEntries] = useState<MachineHoursData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('quick');

  // Quick Add state
  const [runHour, setRunHour] = useState('0.5');
  const [stopHour, setStopHour] = useState('0.1');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState(new Date().toISOString().slice(0, 16));
  const [currentTime, setCurrentTime] = useState(new Date());
  const timeRef = useRef<NodeJS.Timeout | null>(null);

  // Batch state
  const [batchConfig, setBatchConfig] = useState<BatchConfig>({
    fromDate: toDateTimeLocal(new Date(new Date().setHours(0, 0, 0, 0))),
    toDate: toDateTimeLocal(new Date(new Date().setHours(23, 59, 0, 0))),
    interval: 1,
    intervalUnit: 'hours',
    allMachines: true,
    fillGaps: false,
    randomGaps: false,
    gapPercent: 30,
  });
  const [batchPreview, setBatchPreview] = useState<BatchEntry[]>([]);
  const [isBatchInserting, setIsBatchInserting] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);

  // Clock tick
  useEffect(() => {
    timeRef.current = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { if (timeRef.current) clearInterval(timeRef.current); };
  }, []);

  // Load data
  const loadMachines = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await machineSettingsApi.getAll();
      setMachines(data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load machines' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRecentEntries = useCallback(async () => {
    try {
      const data = await machineHoursApi.getAll({ limit: 10 });
      setRecentEntries(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadMachines(); loadRecentEntries(); }, [loadMachines, loadRecentEntries]);

  // Auto-select first machine
  useEffect(() => {
    if (machines.length > 0 && !machineName) {
      setMachineName(machines[0].machineName);
    }
  }, [machines, machineName]);

  // --- Quick Add ---

  const handleRandomize = () => {
    setRunHour(Math.floor(Math.random() * 1001).toString());
    setStopHour(Math.floor(Math.random() * 1001).toString());
  };

  const handleQuickAdd = async (status: 'RUN' | 'STOP' | 'REWORK') => {
    if (!machineName) { setMessage({ type: 'error', text: 'Please select a machine' }); return; }

    try {
      setIsSubmitting(true);
      setMessage(null);

      const logTime = useCustomTime ? new Date(customTime).toISOString() : new Date().toISOString();
      const runH = parseFloat(runHour) || 0;
      const stopH = parseFloat(stopHour) || 0;
      const isRework = status === 'REWORK';
      const isRun = status === 'RUN';
      const isStop = status === 'STOP';

      await machineHoursApi.create({
        logTime,
        machineName,
        runHour: isStop ? 0 : runH,
        stopHour: isRun ? 0 : stopH,
        runStatus: (isRun || (isRework && Math.random() > 0.5)) ? 1 : 0,
        stopStatus: isStop ? 1 : 0,
        reworkStatus: isRework ? 1 : null,
      });

      const hourVal = isStop ? stopH : runH;
      setMessage({ type: 'success', text: `Added ${status} (${hourVal}h) for ${machineName}` });
      await loadRecentEntries();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to add data' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Batch ---

  const updateBatch = (patch: Partial<BatchConfig>) =>
    setBatchConfig(prev => ({ ...prev, ...patch }));

  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const generateBatchPreview = async () => {
    const from = new Date(batchConfig.fromDate);
    const to = new Date(batchConfig.toDate);
    if (from >= to) { setMessage({ type: 'error', text: 'From date must be before To date' }); return; }

    const targetMachines = batchConfig.allMachines
      ? machines.map(m => m.machineName)
      : machineName ? [machineName] : [];

    if (targetMachines.length === 0) {
      setMessage({ type: 'error', text: batchConfig.allMachines ? 'No machines found' : 'Select a machine' });
      return;
    }

    const multipliers = { seconds: 1000, minutes: 60_000, hours: 3_600_000 };
    const intervalMs = batchConfig.interval * multipliers[batchConfig.intervalUnit];

    // Build all time slots
    const allEntries: BatchEntry[] = [];
    let t = from.getTime();
    const end = to.getTime();
    while (t <= end) {
      for (const m of targetMachines) allEntries.push(generateRandomEntry(new Date(t), m));
      t += intervalMs;
    }

    const totalSlots = allEntries.length;

    // Random Gaps mode: randomly skip some time slots to create gaps
    if (batchConfig.randomGaps && !batchConfig.fillGaps) {
      const skipRate = batchConfig.gapPercent / 100;
      // Group entries by time slot, skip entire time slots (all machines at once)
      const timeSlots = new Map<number, BatchEntry[]>();
      for (const entry of allEntries) {
        const key = entry.logTime.getTime();
        if (!timeSlots.has(key)) timeSlots.set(key, []);
        timeSlots.get(key)!.push(entry);
      }
      const filtered: BatchEntry[] = [];
      for (const [, entries] of timeSlots) {
        if (Math.random() >= skipRate) {
          filtered.push(...entries);
        }
      }
      const skipped = totalSlots - filtered.length;
      setBatchPreview(filtered);
      const label = batchConfig.allMachines ? `${targetMachines.length} machines` : targetMachines[0];
      setMessage({ type: 'success', text: `Generated ${filtered.length} entries for ${label} (${skipped} skipped as random gaps, ~${batchConfig.gapPercent}%)` });
      return;
    }

    // Fill Gaps mode: filter out slots that already have data
    if (batchConfig.fillGaps) {
      try {
        setIsPreviewLoading(true);
        setMessage(null);

        const fromStr = from.toISOString().slice(0, 19).replace('T', ' ');
        const toStr = to.toISOString().slice(0, 19).replace('T', ' ');
        const existing = await machineHoursApi.getExistingTimes(fromStr, toStr);

        // Build per-machine timestamp arrays + rounded Set for fast lookup
        const halfInterval = intervalMs / 2;
        const existingSet = new Set<string>();
        const machineTimestamps = new Map<string, number[]>();

        for (const rec of existing) {
          const recTime = new Date(rec.logTime).getTime();
          // Round to nearest interval grid point
          const rounded = Math.round((recTime - from.getTime()) / intervalMs) * intervalMs + from.getTime();
          existingSet.add(`${rec.machineName}|${rounded}`);
          // Also store raw timestamps per machine for proximity check
          if (!machineTimestamps.has(rec.machineName)) machineTimestamps.set(rec.machineName, []);
          machineTimestamps.get(rec.machineName)!.push(recTime);
        }

        // Filter: keep only entries where no existing data nearby
        const gapEntries = allEntries.filter(entry => {
          const entryTime = entry.logTime.getTime();
          // Fast check: rounded grid match
          if (existingSet.has(`${entry.machineName}|${entryTime}`)) return false;
          // Proximity check: any existing record within ±halfInterval
          const timestamps = machineTimestamps.get(entry.machineName);
          if (timestamps) {
            for (const ts of timestamps) {
              if (Math.abs(ts - entryTime) < halfInterval) return false;
            }
          }
          return true;
        });

        setBatchPreview(gapEntries);
        const label = batchConfig.allMachines ? `${targetMachines.length} machines` : targetMachines[0];
        setMessage({
          type: 'success',
          text: `Found ${gapEntries.length} gaps out of ${totalSlots} slots for ${label} (${totalSlots - gapEntries.length} already have data)`
        });
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to check existing data' });
      } finally {
        setIsPreviewLoading(false);
      }
    } else {
      setBatchPreview(allEntries);
      const label = batchConfig.allMachines ? `${targetMachines.length} machines` : targetMachines[0];
      setMessage({ type: 'success', text: `Generated ${allEntries.length} entries for ${label}` });
    }
  };

  const handleBatchInsert = async () => {
    if (!batchConfig.allMachines && !machineName) { setMessage({ type: 'error', text: 'Select a machine' }); return; }
    if (batchPreview.length === 0) { setMessage({ type: 'error', text: 'Generate preview first' }); return; }

    try {
      setIsBatchInserting(true);
      setBatchProgress(0);
      setMessage(null);

      let count = 0;
      for (const entry of batchPreview) {
        await machineHoursApi.create({
          logTime: entry.logTime.toISOString(),
          machineName: entry.machineName,
          runHour: entry.runHour, stopHour: entry.stopHour,
          runStatus: entry.runStatus, stopStatus: entry.stopStatus,
          reworkStatus: entry.reworkStatus,
        });
        count++;
        setBatchProgress(count);
      }

      const uniqueM = new Set(batchPreview.map(e => e.machineName));
      setMessage({ type: 'success', text: `Inserted ${count} entries for ${uniqueM.size} machine(s)!` });
      setBatchPreview([]);
      setBatchProgress(0);
      await loadRecentEntries();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Batch insert failed' });
    } finally {
      setIsBatchInserting(false);
    }
  };

  // --- Delete ---

  const handleDelete = async (id: number) => {
    try {
      setMessage(null);
      await machineHoursApi.delete(id);
      setRecentEntries(prev => prev.filter(e => e.id !== id));
      setMessage({ type: 'success', text: 'Deleted entry' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete' });
    }
  };

  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const handleDeleteAll = async () => {
    setShowDeleteAllModal(false);
    try {
      setIsDeletingAll(true);
      setMessage(null);
      const result = await machineHoursApi.deleteAll();
      setRecentEntries([]);
      setMessage({ type: 'success', text: `Deleted ${result.count} entries` });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete all' });
    } finally {
      setIsDeletingAll(false);
    }
  };

  // --- Render ---

  return (
    <PageTransition className="p-3 lg:p-5 max-w-[1400px] mx-auto">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </motion.div>
        ) : (
          <motion.div key="content" initial="initial" animate="animate" variants={staggerContainer}>
            {/* Header */}
            <motion.div variants={fadeInUp} className="mb-4">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">Simulation</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Add test data to machine_hours table</p>
            </motion.div>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
                    message.type === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                      : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  }`}
                >
                  {message.type === 'error'
                    ? <AlertCircle className="w-4 h-4 shrink-0" />
                    : <CheckCircle className="w-4 h-4 shrink-0" />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Grid: 2 columns */}
            <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-4">

              {/* Left: Controls */}
              <motion.div variants={fadeInUp} className="space-y-4">
                {/* Machine Selector */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Machine Name
                  </label>
                  <select
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="">Select Machine</option>
                    {machines.map(m => (
                      <option key={m.id} value={m.machineName}>
                        {m.machineName} ({m.groupName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tab Switcher + Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveTab('quick')}
                      className={`flex-1 px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeTab === 'quick'
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Zap className="w-4 h-4" /> Quick Add
                    </button>
                    <button
                      onClick={() => setActiveTab('batch')}
                      className={`flex-1 px-4 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        activeTab === 'batch'
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Calendar className="w-4 h-4" /> Batch Insert
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-4">
                    {activeTab === 'quick' ? (
                      <div className="space-y-4">
                        {/* Quick Add Buttons */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</span>
                            <button
                              type="button" onClick={handleRandomize}
                              className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all flex items-center gap-1"
                            >
                              <Shuffle className="w-3 h-3" /> Random
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => handleQuickAdd('RUN')}
                              disabled={isSubmitting || !machineName}
                              className="py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-sm text-sm"
                            >
                              + RUN
                            </button>
                            <button
                              onClick={() => handleQuickAdd('STOP')}
                              disabled={isSubmitting || !machineName}
                              className="py-3 bg-green-400 hover:bg-green-500 text-gray-900 font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-sm text-sm"
                            >
                              + STOP
                            </button>
                            <button
                              onClick={() => handleQuickAdd('REWORK')}
                              disabled={isSubmitting || !machineName}
                              className="py-3 bg-red-400 hover:bg-red-500 text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] shadow-sm text-sm"
                            >
                              + REWORK
                            </button>
                          </div>
                        </div>

                        {/* Hours */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">Run Hour</label>
                            <input
                              type="number" value={runHour}
                              onChange={(e) => setRunHour(e.target.value)}
                              step="0.01" min="0"
                              className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-yellow-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-green-600 dark:text-green-400 mb-1">Stop Hour</label>
                            <input
                              type="number" value={stopHour}
                              onChange={(e) => setStopHour(e.target.value)}
                              step="0.01" min="0"
                              className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>

                        {/* Log Time */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Log Time</label>
                            <button
                              type="button"
                              onClick={() => setUseCustomTime(!useCustomTime)}
                              className={`px-2 py-0.5 text-xs rounded-md font-medium transition-all ${
                                useCustomTime
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {useCustomTime ? 'Custom' : 'Now'}
                            </button>
                          </div>
                          {useCustomTime ? (
                            <input
                              type="datetime-local"
                              value={customTime}
                              onChange={(e) => setCustomTime(e.target.value)}
                              className="w-full px-3 py-2 border border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                              <span className="font-mono text-sm">{formatDateTime(currentTime)}</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
                          Click a status button to insert data immediately
                        </div>
                      </div>
                    ) : (
                      /* Batch Tab */
                      <div className="space-y-3">
                        {/* Target Machines */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Target</span>
                          <div
                            className="flex items-center gap-2 cursor-pointer select-none"
                            onClick={() => updateBatch({ allMachines: !batchConfig.allMachines })}
                          >
                            <span className={`text-xs font-medium ${!batchConfig.allMachines ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>Single</span>
                            <div className={`relative w-10 h-5 rounded-full transition-all ${batchConfig.allMachines ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${batchConfig.allMachines ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                            <span className={`text-xs font-medium ${batchConfig.allMachines ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                              All ({machines.length})
                            </span>
                          </div>
                        </div>

                        {/* Fill Gaps Toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <SearchSlash className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Fill Gaps</span>
                          </div>
                          <div
                            className="flex items-center gap-2 cursor-pointer select-none"
                            onClick={() => updateBatch({ fillGaps: !batchConfig.fillGaps })}
                          >
                            <span className={`text-xs font-medium ${!batchConfig.fillGaps ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'}`}>Off</span>
                            <div className={`relative w-10 h-5 rounded-full transition-all ${batchConfig.fillGaps ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${batchConfig.fillGaps ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                            <span className={`text-xs font-medium ${batchConfig.fillGaps ? 'text-orange-500 dark:text-orange-400' : 'text-gray-400'}`}>On</span>
                          </div>
                        </div>

                        {batchConfig.fillGaps && (
                          <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-lg">
                            Only generates data for time slots without existing records
                          </div>
                        )}

                        {/* Random Gaps Toggle */}
                        {!batchConfig.fillGaps && (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Shuffle className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Random Gaps</span>
                              </div>
                              <div
                                className="flex items-center gap-2 cursor-pointer select-none"
                                onClick={() => updateBatch({ randomGaps: !batchConfig.randomGaps })}
                              >
                                <span className={`text-xs font-medium ${!batchConfig.randomGaps ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400'}`}>Off</span>
                                <div className={`relative w-10 h-5 rounded-full transition-all ${batchConfig.randomGaps ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${batchConfig.randomGaps ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </div>
                                <span className={`text-xs font-medium ${batchConfig.randomGaps ? 'text-purple-500 dark:text-purple-400' : 'text-gray-400'}`}>On</span>
                              </div>
                            </div>

                            {batchConfig.randomGaps && (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-purple-600 dark:text-purple-400">Gap ratio</span>
                                  <span className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400">{batchConfig.gapPercent}%</span>
                                </div>
                                <input
                                  type="range" min="5" max="80" step="5"
                                  value={batchConfig.gapPercent}
                                  onChange={(e) => updateBatch({ gapPercent: parseInt(e.target.value) })}
                                  className="w-full h-1.5 bg-purple-200 dark:bg-purple-900/40 rounded-full appearance-none cursor-pointer accent-purple-500"
                                />
                                <div className="text-xs text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg">
                                  Randomly skips ~{batchConfig.gapPercent}% of time slots to create gaps
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
                            <input type="datetime-local" value={batchConfig.fromDate}
                              onChange={(e) => updateBatch({ fromDate: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
                            <input type="datetime-local" value={batchConfig.toDate}
                              onChange={(e) => updateBatch({ toDate: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Interval */}
                        <div>
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Interval</label>
                          <div className="flex gap-2">
                            <input type="number" value={batchConfig.interval}
                              onChange={(e) => updateBatch({ interval: Math.max(1, parseInt(e.target.value) || 1) })}
                              min="1"
                              className="w-20 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <select value={batchConfig.intervalUnit}
                              onChange={(e) => updateBatch({ intervalUnit: e.target.value as BatchConfig['intervalUnit'] })}
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="seconds">Seconds</option>
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                            </select>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button onClick={generateBatchPreview}
                            disabled={isPreviewLoading || (!batchConfig.allMachines && !machineName)}
                            className={`flex-1 px-3 py-2 ${batchConfig.fillGaps ? 'bg-orange-500 hover:bg-orange-600' : 'bg-purple-600 hover:bg-purple-700'} text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-all flex items-center justify-center gap-1.5`}
                          >
                            {isPreviewLoading ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                            ) : (
                              <><Eye className="w-4 h-4" /> {batchConfig.fillGaps ? 'Find Gaps' : 'Preview'} {batchPreview.length > 0 && `(${batchPreview.length})`}</>
                            )}
                          </button>
                          <button onClick={() => setBatchPreview([])}
                            disabled={batchPreview.length === 0}
                            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-sm rounded-lg disabled:opacity-40 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Preview Table */}
                        {batchPreview.length > 0 && (
                          <>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                              <div className="max-h-44 overflow-y-auto">
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                    <tr>
                                      <th className="py-1.5 px-2 text-left text-gray-500 dark:text-gray-400">#</th>
                                      <th className="py-1.5 px-2 text-left text-gray-500 dark:text-gray-400">Time</th>
                                      {batchConfig.allMachines && <th className="py-1.5 px-2 text-left text-gray-500 dark:text-gray-400">Machine</th>}
                                      <th className="py-1.5 px-2 text-center text-gray-500 dark:text-gray-400">Hours</th>
                                      <th className="py-1.5 px-2 text-center text-gray-500 dark:text-gray-400">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {batchPreview.slice(0, 50).map((entry, idx) => (
                                      <tr key={idx} className="border-t border-gray-100 dark:border-gray-700">
                                        <td className="py-1 px-2 text-gray-400">{idx + 1}</td>
                                        <td className="py-1 px-2 text-gray-600 dark:text-gray-300">
                                          {entry.logTime.toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        {batchConfig.allMachines && (
                                          <td className="py-1 px-2 text-gray-600 dark:text-gray-300 truncate max-w-[80px]">{entry.machineName}</td>
                                        )}
                                        <td className="py-1 px-2 text-center text-gray-600 dark:text-gray-300">
                                          {entry.runStatus === 1 ? entry.runHour : entry.stopHour}
                                        </td>
                                        <td className="py-1 px-2 text-center">
                                          <StatusBadge run={entry.runStatus} rework={entry.reworkStatus} />
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {batchPreview.length > 50 && (
                                <div className="text-xs text-gray-400 text-center py-1 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                                  Showing 50 of {batchPreview.length.toLocaleString()} entries
                                </div>
                              )}
                            </div>

                            {/* Insert Button */}
                            <button onClick={handleBatchInsert}
                              disabled={isBatchInserting || (!batchConfig.allMachines && !machineName)}
                              className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-2 text-sm"
                            >
                              {isBatchInserting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> {batchProgress.toLocaleString()} / {batchPreview.length.toLocaleString()}</>
                              ) : (
                                <><Play className="w-4 h-4" /> Insert All ({batchPreview.length.toLocaleString()})</>
                              )}
                            </button>

                            {/* Progress */}
                            {isBatchInserting && (
                              <div className="space-y-1">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div className="bg-green-500 h-full rounded-full transition-all duration-150"
                                    style={{ width: `${(batchProgress / batchPreview.length) * 100}%` }} />
                                </div>
                                <div className="text-xs text-center text-gray-400">
                                  {((batchProgress / batchPreview.length) * 100).toFixed(1)}%
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Right: Recent Entries */}
              <motion.div variants={fadeInUp}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 h-full">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                      Recent Entries
                      <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-2">Last 10</span>
                    </h2>
                    {recentEntries.length > 0 && (
                      <button
                        onClick={() => setShowDeleteAllModal(true)}
                        disabled={isDeletingAll}
                        className="px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1"
                      >
                        {isDeletingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Delete All
                      </button>
                    )}
                  </div>

                  {recentEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
                      <Calendar className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No entries yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Machine</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Run</th>
                            <th className="text-right py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Stop</th>
                            <th className="text-center py-2 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                            <th className="py-2 px-2 w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentEntries.map(entry => (
                            <tr key={entry.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                              <td className="py-2 px-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                {formatShortDate(entry.logTime)}
                              </td>
                              <td className="py-2 px-3 text-gray-800 dark:text-gray-200 font-medium truncate max-w-[150px]">
                                {entry.machineName}
                              </td>
                              <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-300 font-mono">
                                {entry.runHour.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-300 font-mono">
                                {entry.stopHour.toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-center">
                                <StatusBadge run={entry.runStatus} rework={entry.reworkStatus} />
                              </td>
                              <td className="py-2 px-2 text-center">
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  className="p-1 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                  title="Delete entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmModal
        open={showDeleteAllModal}
        title="Delete All Data"
        message="This will permanently delete ALL machine_hours data. This action cannot be undone."
        confirmLabel="Delete All"
        variant="danger"
        onConfirm={handleDeleteAll}
        onCancel={() => setShowDeleteAllModal(false)}
      />
    </PageTransition>
  );
};

export default SimulationPage;
