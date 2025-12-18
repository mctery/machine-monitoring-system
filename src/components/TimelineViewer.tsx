// src/components/TimelineViewer.tsx
import { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { getTimelineColor, getRatioCellClass } from '../utils/helpers';
import { format } from 'date-fns';
import { Calendar, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { TimelineSegment, TimelineData } from '../types';

// Memoized timeline segment component
const TimelineSegmentBar = memo(({
  segment,
  widthPercent
}: {
  segment: TimelineSegment;
  widthPercent: number;
}) => (
  <div
    className={`${getTimelineColor(segment.state)} border-r border-gray-400 dark:border-gray-800 hover:opacity-80 transition-opacity cursor-pointer`}
    style={{ width: `${widthPercent}%` }}
    title={`${segment.state}: ${segment.duration.toFixed(1)}h\n${format(segment.start, 'HH:mm')} - ${format(segment.end, 'HH:mm')}`}
    role="img"
    aria-label={`${segment.state} for ${segment.duration.toFixed(1)} hours`}
  />
));

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
  const [fromDate, setFromDate] = useState(format(dateRange.from, "yyyy-MM-dd'T'HH:mm"));
  const [toDate, setToDate] = useState(format(dateRange.to, "yyyy-MM-dd'T'HH:mm"));
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
    const from = new Date(fromDate);
    const to = new Date(toDate);

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
  }, [fromDate, toDate, setDateRange, loadTimelineData]);

  const handleRetry = useCallback(() => {
    clearError();
    loadTimelineData();
  }, [clearError, loadTimelineData]);

  const displayError = validationError || error;

  return (
    <div className="h-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-6 transition-colors flex flex-col">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Timeline Viewer</h1>

      {/* Date Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 shadow transition-colors">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
            <label htmlFor="from-date" className="text-sm font-medium text-gray-700 dark:text-gray-200">From:</label>
            <input
              id="from-date"
              type="datetime-local"
              value={fromDate}
              max={toDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setValidationError(null);
              }}
              className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
              aria-describedby={validationError ? "date-error" : undefined}
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="to-date" className="text-sm font-medium text-gray-700 dark:text-gray-200">To:</label>
            <input
              id="to-date"
              type="datetime-local"
              value={toDate}
              min={fromDate}
              onChange={(e) => {
                setToDate(e.target.value);
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
      </div>

      {/* Timeline Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64" role="status" aria-label="Loading timeline">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : timelineData.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400 shadow transition-colors">
            No timeline data available for the selected date range.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow transition-colors">
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
                    <>
                      <GroupHeaderRow key={`group-${groupName}`} groupName={groupName} colSpan={10} />
                      {items.map((item, index) => (
                        <TimelineRow key={`${groupName}-${item.machineName || index}`} item={item} />
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TimelineViewer);
