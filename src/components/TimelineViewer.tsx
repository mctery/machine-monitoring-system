// src/components/TimelineViewer.tsx
import { useEffect, useState, useCallback, useRef, memo, useMemo, Fragment } from 'react';
import { motion } from 'framer-motion';
import { useMachineStore } from '../store/useMachineStore';
import { getTimelineColor, getRatioCellClass } from '../utils/helpers';
import { format } from 'date-fns';
import { Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { TimelineSegment, TimelineData } from '../types';
import PageTransition, { fadeInUp, staggerContainer, AnimatePresence, contentFadeIn } from './PageTransition';

// Format Date to datetime-local input value (local time, not UTC)
const toDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Tooltip show/hide callbacks type
type TooltipHandlers = {
  show: (e: React.MouseEvent, text: string) => void;
  move: (e: React.MouseEvent) => void;
  hide: () => void;
};

// Memoized timeline segment component (absolute positioned by wall-clock time)
const TimelineSegmentBar = memo(({
  segment,
  rangeStart,
  totalMs,
  tip
}: {
  segment: TimelineSegment;
  rangeStart: number;
  totalMs: number;
  tip: TooltipHandlers;
}) => {
  const startStr = format(segment.start, 'dd/MM/yyyy HH:mm');
  const endStr = format(segment.end, 'dd/MM/yyyy HH:mm');
  const tooltipText = `${segment.state}\nLog Time: ${startStr} - ${endStr}\nRun Hour: ${segment.runHour} | Stop Hour: ${segment.stopHour}`;

  const leftPercent = totalMs > 0 ? ((segment.start.getTime() - rangeStart) / totalMs) * 100 : 0;
  const widthPercent = totalMs > 0 ? ((segment.end.getTime() - segment.start.getTime()) / totalMs) * 100 : 0;

  return (
    <div
      className={`absolute top-0 bottom-0 ${getTimelineColor(segment.state)} hover:opacity-80 transition-opacity cursor-pointer`}
      style={{ left: `${leftPercent}%`, width: `${Math.max(widthPercent, 0.2)}%` }}
      onMouseEnter={(e) => tip.show(e, tooltipText)}
      onMouseMove={tip.move}
      onMouseLeave={tip.hide}
      role="img"
      aria-label={`${segment.state} from ${startStr} to ${endStr}, Run: ${segment.runHour}, Stop: ${segment.stopHour}`}
    />
  );
});

TimelineSegmentBar.displayName = 'TimelineSegmentBar';

// Memoized timeline row component
const TimelineRow = memo(({ item, rangeStart, totalMs, tip }: { item: TimelineData; rangeStart: number; totalMs: number; tip: TooltipHandlers }) => {
  return (
    <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs">
      <td className="px-2 py-1.5 border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 z-10 text-gray-900 dark:text-white">
        {item.machineName}
      </td>
      <td className="px-2 py-1.5 text-center border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{item.run.toFixed(2)}</td>
      <td className="px-2 py-1.5 text-center border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{item.warning}</td>
      <td className="px-2 py-1.5 text-center border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{item.stop.toFixed(2)}</td>
      <td
        className={`px-2 py-1.5 text-center border-r border-gray-200 dark:border-gray-700 font-medium ${getRatioCellClass(item.actualRatio1)}`}
      >
        {item.actualRatio1.toFixed(2)} %
      </td>
      <td
        className={`px-2 py-1.5 text-center border-r border-gray-200 dark:border-gray-700 font-medium ${getRatioCellClass(item.actualRatio2)}`}
      >
        {item.actualRatio2.toFixed(2)} %
      </td>
      <td
        className={`px-2 py-1.5 text-center border-r border-gray-200 dark:border-gray-700 font-medium ${getRatioCellClass(item.trueRatio1)}`}
      >
        {item.trueRatio1.toFixed(2)} %
      </td>
      <td
        className={`px-2 py-1.5 text-center border-r border-gray-200 dark:border-gray-700 font-medium ${getRatioCellClass(item.trueRatio2)}`}
      >
        {item.trueRatio2.toFixed(2)} %
      </td>
      <td className="px-2 py-1.5 text-center border-r border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{item.warningRatio}</td>
      <td className="px-2 py-1.5">
        <div className="relative h-7 rounded overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" role="img" aria-label={`Timeline for ${item.machineName}`}>
          {item.timeline.map((segment, idx) => (
            <TimelineSegmentBar
              key={idx}
              segment={segment}
              rangeStart={rangeStart}
              totalMs={totalMs}
              tip={tip}
            />
          ))}
        </div>
      </td>
    </tr>
  );
});

TimelineRow.displayName = 'TimelineRow';

// Group header row component
const GroupHeaderRow = memo(({ groupName, colSpan }: { groupName: string; colSpan: number }) => (
  <tr className="bg-gray-300 dark:bg-gray-600">
    <td colSpan={colSpan} className="px-2 py-1.5 font-bold text-xs text-gray-800 dark:text-white">
      {groupName}
    </td>
  </tr>
));

GroupHeaderRow.displayName = 'GroupHeaderRow';

const TimelineViewer = () => {
  const { timelineData, dateRange, setDateRange, loadTimelineData, exportToCSV, isLoadingTimeline: isLoading, error, clearError } = useMachineStore();
  const [fromStr, setFromStr] = useState(toDateTimeLocal(dateRange.from));
  const [toStr, setToStr] = useState(toDateTimeLocal(dateRange.to));
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
    const from = new Date(fromStr);
    const to = new Date(toStr);

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
  }, [fromStr, toStr, setDateRange, loadTimelineData]);

  const handleRetry = useCallback(() => {
    clearError();
    loadTimelineData();
  }, [clearError, loadTimelineData]);

  // Custom tooltip (instant, no delay)
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tip: TooltipHandlers = useMemo(() => ({
    show: (e: React.MouseEvent, text: string) => {
      const el = tooltipRef.current;
      if (!el) return;
      el.innerText = text;
      el.style.left = `${e.clientX + 12}px`;
      el.style.top = `${e.clientY - 10}px`;
      el.style.display = 'block';
    },
    move: (e: React.MouseEvent) => {
      const el = tooltipRef.current;
      if (!el) return;
      el.style.left = `${e.clientX + 12}px`;
      el.style.top = `${e.clientY - 10}px`;
    },
    hide: () => {
      const el = tooltipRef.current;
      if (el) el.style.display = 'none';
    }
  }), []);

  // Compute dateRange timestamps for timeline positioning
  const rangeStart = dateRange.from.getTime();
  const totalMs = dateRange.to.getTime() - rangeStart;

  // Generate time axis markers based on From/To date range
  const timeAxisMarkers = useMemo(() => {
    const from = dateRange.from;
    const to = dateRange.to;
    const totalRange = to.getTime() - from.getTime();
    if (totalRange <= 0) return [];

    // Generate 5 evenly spaced markers from "from" to "to"
    const markerCount = 5;
    const markers: { label: string; percent: number }[] = [];
    const rangeHours = totalRange / (1000 * 60 * 60);
    const isMultiDay = rangeHours > 48;

    for (let i = 0; i < markerCount; i++) {
      const percent = (i / (markerCount - 1)) * 100;
      const time = new Date(from.getTime() + (i / (markerCount - 1)) * totalRange);
      const label = isMultiDay
        ? format(time, 'MM/dd HH:mm')
        : format(time, 'HH:mm');
      markers.push({ label, percent });
    }
    return markers;
  }, [dateRange]);

  const displayError = validationError || error;

  return (
    <PageTransition className="h-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 transition-colors flex flex-col">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.h1 variants={fadeInUp} className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Timeline Viewer
        </motion.h1>

        {/* Date Controls */}
        <motion.div variants={fadeInUp} className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4 shadow transition-colors">
        {/* Date Range */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="from-datetime" className="text-sm font-medium text-gray-700 dark:text-gray-200">From:</label>
            <input
              id="from-datetime"
              type="datetime-local"
              value={fromStr}
              onChange={(e) => {
                setFromStr(e.target.value);
                setValidationError(null);
              }}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
              aria-describedby={validationError ? "date-error" : undefined}
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="to-datetime" className="text-sm font-medium text-gray-700 dark:text-gray-200">To:</label>
            <input
              id="to-datetime"
              type="datetime-local"
              value={toStr}
              onChange={(e) => {
                setToStr(e.target.value);
                setValidationError(null);
              }}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
              aria-describedby={validationError ? "date-error" : undefined}
            />
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
              <h2 className="px-3 py-2 text-base font-bold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">
                Timeline : All Machine
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" role="table" aria-label="Machine timeline data">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-xs">
                      <th scope="col" className="px-2 py-2 text-left border-r border-gray-300 dark:border-gray-600 sticky left-0 bg-gray-200 dark:bg-gray-700 z-10 min-w-[120px]">NAME</th>
                      <th scope="col" className="px-2 py-2 text-center border-r border-gray-300 dark:border-gray-600">RUN</th>
                      <th scope="col" className="px-2 py-2 text-center border-r border-gray-300 dark:border-gray-600">WARNING</th>
                      <th scope="col" className="px-2 py-2 text-center border-r border-gray-300 dark:border-gray-600">STOP</th>
                      <th scope="col" className="px-2 py-2 text-center border-r border-gray-300 dark:border-gray-600">ACTUAL<br />RATIO 1</th>
                      <th scope="col" className="px-2 py-2 text-center border-r border-gray-300 dark:border-gray-600">ACTUAL<br />RATIO 2</th>
                      <th scope="col" className="px-2 py-2 text-center border-r border-gray-300 dark:border-gray-600">TRUE<br />RATIO 1</th>
                      <th scope="col" className="px-2 py-2 text-center border-r border-gray-300 dark:border-gray-600">TRUE<br />RATIO 2</th>
                      <th scope="col" className="px-2 py-2 text-center border-r border-gray-300 dark:border-gray-600">WARNING<br />RATIO</th>
                      <th scope="col" className="px-2 py-1 text-left min-w-[500px]">
                        <div className="text-[10px] font-bold mb-0.5">TIMELINE</div>
                        <div className="relative w-full h-3">
                          {timeAxisMarkers.map((marker, i) => (
                            <span
                              key={i}
                              className={`absolute bottom-0 text-[9px] font-normal text-gray-500 dark:text-gray-400 ${
                                i === 0 ? 'left-0' : i === timeAxisMarkers.length - 1 ? 'right-0' : '-translate-x-1/2'
                              }`}
                              style={i > 0 && i < timeAxisMarkers.length - 1 ? { left: `${marker.percent}%` } : undefined}
                            >
                              {marker.label}
                            </span>
                          ))}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {groupedData.map(([groupName, items]) => (
                      <Fragment key={groupName}>
                        <GroupHeaderRow groupName={groupName} colSpan={10} />
                        {items.map((item, index) => (
                          <TimelineRow key={`${groupName}-${item.machineName || index}`} item={item} rangeStart={rangeStart} totalMs={totalMs} tip={tip} />
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

      {/* Instant tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 hidden px-2.5 py-1.5 text-xs bg-gray-900 text-white rounded shadow-lg whitespace-pre pointer-events-none"
      />
    </PageTransition>
  );
};

export default memo(TimelineViewer);
