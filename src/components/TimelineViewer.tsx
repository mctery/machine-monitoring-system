// src/components/TimelineViewer.tsx
import { useEffect, useState, useCallback, memo, useMemo, Fragment } from 'react';
import { motion } from 'framer-motion';
import { useMachineStore } from '../store/useMachineStore';
import { getTimelineColor, getRatioCellClass } from '../utils/helpers';
import { format } from 'date-fns';
import { Calendar, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { TimelineSegment, TimelineData } from '../types';
import PageTransition, { fadeInUp, staggerContainer, AnimatePresence, contentFadeIn } from './PageTransition';

// Memoized timeline segment component
const TimelineSegmentBar = memo(({
  segment,
  widthPercent
}: {
  segment: TimelineSegment;
  widthPercent: number;
}) => {
  const startStr = format(segment.start, 'dd/MM/yyyy HH:mm');
  const endStr = format(segment.end, 'dd/MM/yyyy HH:mm');
  const tooltip = `${segment.state}: ${segment.duration.toFixed(1)} hrs\n${startStr} - ${endStr}`;

  return (
    <div
      className={`${getTimelineColor(segment.state)} border-r border-gray-400 dark:border-gray-800 hover:opacity-80 transition-opacity cursor-pointer`}
      style={{ width: `${widthPercent}%` }}
      title={tooltip}
      role="img"
      aria-label={`${segment.state} for ${segment.duration.toFixed(1)} hours from ${startStr} to ${endStr}`}
    />
  );
});

TimelineSegmentBar.displayName = 'TimelineSegmentBar';

// Memoized timeline row component
const TimelineRow = memo(({ item }: { item: TimelineData }) => {
  const totalDuration = useMemo(
    () => item.timeline.reduce((sum, s) => sum + s.duration, 0),
    [item.timeline]
  );

  return (
    <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
      <td className="px-4 py-3 border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 z-10 text-gray-900 dark:text-white">
        {item.machineName}
      </td>
      <td className="px-3 py-3 text-center border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{item.run.toFixed(1)}</td>
      <td className="px-3 py-3 text-center border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{item.warning}</td>
      <td className="px-3 py-3 text-center border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{item.stop.toFixed(1)}</td>
      <td
        className={`px-3 py-3 text-center border-r border-gray-200 dark:border-gray-700 font-medium ${getRatioCellClass(item.actualRatio1)}`}
      >
        {item.actualRatio1.toFixed(2)}
      </td>
      <td className="px-3 py-3 text-center border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{item.actualRatio2.toFixed(2)}</td>
      <td
        className={`px-3 py-3 text-center border-r border-gray-200 dark:border-gray-700 font-medium ${getRatioCellClass(item.trueRatio1)}`}
      >
        {item.trueRatio1.toFixed(2)}
      </td>
      <td className="px-3 py-3 text-center border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{item.trueRatio2.toFixed(2)}</td>
      <td className="px-3 py-3 text-center border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{item.warningRatio}</td>
      <td className="px-4 py-3">
        <div className="flex h-10 rounded overflow-hidden border border-gray-300 dark:border-gray-600" role="img" aria-label={`Timeline for ${item.machineName}`}>
          {item.timeline.map((segment, idx) => {
            const widthPercent = totalDuration > 0 ? (segment.duration / totalDuration) * 100 : 0;
            return (
              <TimelineSegmentBar
                key={idx}
                segment={segment}
                widthPercent={widthPercent}
              />
            );
          })}
        </div>
      </td>
    </tr>
  );
});

TimelineRow.displayName = 'TimelineRow';

// Group header row component
const GroupHeaderRow = memo(({ groupName, colSpan }: { groupName: string; colSpan: number }) => (
  <tr className="bg-gray-300 dark:bg-gray-600">
    <td colSpan={colSpan} className="px-4 py-2 font-bold text-gray-800 dark:text-white">
      {groupName}
    </td>
  </tr>
));

GroupHeaderRow.displayName = 'GroupHeaderRow';

const TimelineViewer = () => {
  const { timelineData, dateRange, setDateRange, loadTimelineData, exportToCSV, isLoading, error, clearError } = useMachineStore();
  const [fromDateStr, setFromDateStr] = useState(format(dateRange.from, "yyyy-MM-dd"));
  const [fromTimeStr, setFromTimeStr] = useState(format(dateRange.from, "HH") + ":00");
  const [toDateStr, setToDateStr] = useState(format(dateRange.to, "yyyy-MM-dd"));
  const [toTimeStr, setToTimeStr] = useState(format(dateRange.to, "HH") + ":00");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    loadTimelineData();
  }, [loadTimelineData]);

  // Group timeline data by groupName
  const groupedData = useMemo(() => {
    const groups = new Map<string, TimelineData[]>();
    for (const item of timelineData) {
      const group = item.groupName || 'Unknown';
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(item);
    }
    // Sort groups alphabetically
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [timelineData]);

  const handleUpdate = useCallback(() => {
    const from = new Date(`${fromDateStr}T${fromTimeStr}:00`);
    const to = new Date(`${toDateStr}T${toTimeStr}:59`); // Add 59 seconds to include the full hour

    // Validate dates
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      setValidationError('Please enter valid dates');
      return;
    }

    if (from > to) {
      setValidationError('"From" date must be before "To" date');
      return;
    }

    setValidationError(null);
    const success = setDateRange({ from, to });
    if (success) {
      loadTimelineData();
    }
  }, [fromDateStr, fromTimeStr, toDateStr, toTimeStr, setDateRange, loadTimelineData]);

  const handleRetry = useCallback(() => {
    clearError();
    loadTimelineData();
  }, [clearError, loadTimelineData]);

  // Preset date range handlers
  const setPresetRange = useCallback((preset: 'today' | 'yesterday' | 'thisWeek' | 'last7Days' | 'thisMonth' | 'last30Days') => {
    const now = new Date();
    let from: Date;
    let to: Date;

    switch (preset) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'yesterday':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
        break;
      case 'thisWeek': {
        const dayOfWeek = now.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      }
      case 'last7Days':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'thisMonth':
        from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
      case 'last30Days':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        break;
    }

    setFromDateStr(format(from, "yyyy-MM-dd"));
    setFromTimeStr(format(from, "HH") + ":00");
    setToDateStr(format(to, "yyyy-MM-dd"));
    setToTimeStr(format(to, "HH") + ":00");
    setValidationError(null);
    const success = setDateRange({ from, to });
    if (success) {
      loadTimelineData();
    }
  }, [setDateRange, loadTimelineData]);

  const displayError = validationError || error;

  return (
    <PageTransition className="h-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6 transition-colors flex flex-col">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.h1 variants={fadeInUp} className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          Timeline Viewer
        </motion.h1>

        {/* Date Controls */}
        <motion.div variants={fadeInUp} className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow transition-colors">
        {/* Quick Presets */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">Quick:</span>
          <button
            onClick={() => setPresetRange('today')}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-200"
          >
            Today
          </button>
          <button
            onClick={() => setPresetRange('yesterday')}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-200"
          >
            Yesterday
          </button>
          <button
            onClick={() => setPresetRange('thisWeek')}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-200"
          >
            This Week
          </button>
          <button
            onClick={() => setPresetRange('last7Days')}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-200"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setPresetRange('thisMonth')}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-200"
          >
            This Month
          </button>
          <button
            onClick={() => setPresetRange('last30Days')}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors text-gray-700 dark:text-gray-200"
          >
            Last 30 Days
          </button>
        </div>

        {/* Custom Date Range */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
            <label htmlFor="from-date" className="text-sm font-medium text-gray-700 dark:text-gray-200">From:</label>
            <input
              id="from-date"
              type="date"
              value={fromDateStr}
              onChange={(e) => {
                setFromDateStr(e.target.value);
                setValidationError(null);
              }}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white w-32"
              aria-describedby={validationError ? "date-error" : undefined}
            />
            <select
              id="from-time"
              value={fromTimeStr}
              onChange={(e) => {
                setFromTimeStr(e.target.value);
                setValidationError(null);
              }}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white w-24"
            >
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0');
                return <option key={hour} value={`${hour}:00`}>{hour}:00</option>;
              })}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="to-date" className="text-sm font-medium text-gray-700 dark:text-gray-200">To:</label>
            <input
              id="to-date"
              type="date"
              value={toDateStr}
              onChange={(e) => {
                setToDateStr(e.target.value);
                setValidationError(null);
              }}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white w-32"
              aria-describedby={validationError ? "date-error" : undefined}
            />
            <select
              id="to-time"
              value={toTimeStr}
              onChange={(e) => {
                setToTimeStr(e.target.value);
                setValidationError(null);
              }}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white w-24"
            >
              {Array.from({ length: 24 }, (_, i) => {
                const hour = i.toString().padStart(2, '0');
                return <option key={hour} value={`${hour}:00`}>{hour}:00</option>;
              })}
            </select>
          </div>

          <button
            onClick={handleUpdate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
          >
            UPDATE
          </button>

          <button
            onClick={exportToCSV}
            disabled={timelineData.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-medium transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            EXPORT
          </button>
        </div>

        {displayError && (
          <div id="date-error" className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400" role="alert">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            <span>{displayError}</span>
            {error && (
              <button
                onClick={handleRetry}
                className="ml-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* Timeline Table */}
      <motion.div variants={fadeInUp} className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center h-64"
              role="status"
              aria-label="Loading timeline"
            >
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="sr-only">Loading...</span>
            </motion.div>
          ) : timelineData.length === 0 ? (
            <motion.div
              key="empty"
              variants={contentFadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400 shadow transition-colors"
            >
              No timeline data available for the selected date range.
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={contentFadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow transition-colors"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table" aria-label="Machine timeline data">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white">
                      <th scope="col" className="px-4 py-3 text-left border-r border-gray-300 dark:border-gray-600 sticky left-0 bg-gray-200 dark:bg-gray-700 z-10 min-w-[150px]">NAME</th>
                      <th scope="col" className="px-3 py-3 text-center border-r border-gray-300 dark:border-gray-600">RUN</th>
                      <th scope="col" className="px-3 py-3 text-center border-r border-gray-300 dark:border-gray-600">WARNING</th>
                      <th scope="col" className="px-3 py-3 text-center border-r border-gray-300 dark:border-gray-600">STOP</th>
                      <th scope="col" className="px-3 py-3 text-center border-r border-gray-300 dark:border-gray-600">ACTUAL<br />RATIO 1</th>
                      <th scope="col" className="px-3 py-3 text-center border-r border-gray-300 dark:border-gray-600">ACTUAL<br />RATIO 2</th>
                      <th scope="col" className="px-3 py-3 text-center border-r border-gray-300 dark:border-gray-600">TRUE<br />RATIO 1</th>
                      <th scope="col" className="px-3 py-3 text-center border-r border-gray-300 dark:border-gray-600">TRUE<br />RATIO 2</th>
                      <th scope="col" className="px-3 py-3 text-center border-r border-gray-300 dark:border-gray-600">WARNING<br />RATIO</th>
                      <th scope="col" className="px-4 py-3 text-left min-w-[500px]">TIMELINE</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {groupedData.map(([groupName, items]) => (
                      <Fragment key={groupName}>
                        <GroupHeaderRow groupName={groupName} colSpan={10} />
                        {items.map((item, index) => (
                          <TimelineRow key={`${groupName}-${item.machineName || index}`} item={item} />
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </motion.div>
    </PageTransition>
  );
};

export default memo(TimelineViewer);
