// src/components/MachineStatusTable.tsx
import { useEffect, memo, useMemo, useState, useCallback, useRef } from 'react';
import { ColumnDef, CellContext } from '@tanstack/react-table';
import { useMachineStore } from '../store/useMachineStore';
import { Loader2, AlertCircle } from 'lucide-react';
import { Machine } from '../types';
import DataTable from './DataTable';

const REFRESH_INTERVAL = 10000; // 10 seconds

// Helper functions for cell styling
const getStateClass = (state: string) => {
  if (state === 'RUN') return 'bg-yellow-300 text-gray-900 font-medium text-center';
  if (state === 'STOP') return 'bg-green-400 text-gray-900 font-medium text-center';
  return 'text-center';
};

const getRatioClass = (actual: number, target: number) => {
  if (actual < target) return 'bg-red-500 text-white text-center';
  return 'bg-green-400 text-gray-900 text-center';
};

// Column definitions for Machine Status
const machineColumns: ColumnDef<Machine, unknown>[] = [
  {
    accessorKey: 'group',
    header: 'Group',
    enableSorting: true,
    meta: { className: 'text-left' },
  },
  {
    accessorKey: 'machineName',
    header: 'Machine Name',
    enableSorting: true,
    meta: { className: 'text-left' },
  },
  {
    accessorKey: 'state',
    header: 'State',
    enableSorting: true,
    meta: {
      cellClassName: (props: CellContext<Machine, unknown>) => getStateClass(props.getValue() as string),
    },
  },
  {
    accessorKey: 'rework',
    header: 'Rework',
    enableSorting: false,
    meta: { className: 'text-center' },
  },
  {
    accessorKey: 'runHours',
    header: () => <span>RUN<br/>(Hours)</span>,
    enableSorting: true,
    cell: (props) => (props.getValue() as number).toFixed(2),
    meta: { className: 'text-center' },
  },
  {
    accessorKey: 'stopHours',
    header: () => <span>STOP<br/>(Hours)</span>,
    enableSorting: true,
    cell: (props) => (props.getValue() as number).toFixed(2),
    meta: { className: 'text-center' },
  },
  {
    accessorKey: 'weeklyActualRatio',
    header: () => <span>Weekly Actual<br/>Ratio(%)</span>,
    enableSorting: true,
    meta: {
      cellClassName: (props: CellContext<Machine, unknown>) => {
        const row = props.row.original;
        return getRatioClass(props.getValue() as number, row.weeklyTargetRatio);
      },
    },
  },
  {
    accessorKey: 'weeklyTargetRatio',
    header: () => <span>Weekly Target<br/>Ratio(%)</span>,
    enableSorting: false,
    meta: { className: 'text-center' },
  },
  {
    accessorKey: 'monthlyActualRatio',
    header: () => <span>Monthly Actual<br/>Ratio(%)</span>,
    enableSorting: true,
    meta: {
      cellClassName: (props: CellContext<Machine, unknown>) => {
        const row = props.row.original;
        return getRatioClass(props.getValue() as number, row.monthlyTargetRatio);
      },
    },
  },
  {
    accessorKey: 'monthlyTargetRatio',
    header: () => <span>Monthly Target<br/>Ratio(%)</span>,
    enableSorting: false,
    meta: { className: 'text-center' },
  },
];

const MachineStatusTable = () => {
  const { machines, availableGroups, loadMachines, error } = useMachineStore();
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format timestamp
  const formatTimestamp = useCallback(() => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }, []);

  // Fetch data and update timestamp (silent refresh - no loading indicator)
  const fetchData = useCallback(async () => {
    await loadMachines();
    setLastUpdated(formatTimestamp());
    setIsInitialLoad(false);
  }, [loadMachines, formatTimestamp]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 10 seconds (silent update)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  // Split machines into left and right tables dynamically
  const { leftMachines, rightMachines } = useMemo(() => {
    // Split groups: first half to left, second half to right
    const midPoint = Math.ceil(availableGroups.length / 2);
    const leftGroups = availableGroups.slice(0, midPoint);
    const rightGroups = availableGroups.slice(midPoint);

    return {
      leftMachines: machines.filter(m => leftGroups.includes(m.group)),
      rightMachines: machines.filter(m => rightGroups.includes(m.group))
    };
  }, [machines, availableGroups]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 dark:text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  // Only show full-screen loader on initial load
  if (isInitialLoad && machines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Two-column grid layout - scrollable */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-auto">
          <DataTable
            data={leftMachines}
            columns={machineColumns}
            enableSorting={true}
            stickyHeader={true}
          />
        </div>

        {/* Right Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-auto">
          <DataTable
            data={rightMachines}
            columns={machineColumns}
            enableSorting={true}
            stickyHeader={true}
          />
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex-shrink-0 pt-3 pb-1 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span>LAST UPDATED TIME : {lastUpdated}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            (Auto-refresh: 10s)
          </span>
        </div>
        <span>Copyright &copy; 2023 Tire Mold (Thailand) Co., Ltd. (Bridgestone Group)</span>
      </div>
    </div>
  );
};

export default memo(MachineStatusTable);
