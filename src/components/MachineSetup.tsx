// src/components/MachineSetup.tsx
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useMachineStore, useFilteredMachines, useGroups } from '../store/useMachineStore';
import { Settings, Save, X, AlertCircle } from 'lucide-react';
import { Machine } from '../types';
import DataTable from './DataTable';

const MachineSetup = () => {
  const { machines, selectedGroup, setSelectedGroup, loadMachines, updateMachineTarget, error, clearError } = useMachineStore();
  const filteredMachines = useFilteredMachines();
  const groups = useGroups();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [weeklyTarget, setWeeklyTarget] = useState(50);
  const [monthlyTarget, setMonthlyTarget] = useState(50);

  useEffect(() => {
    if (machines.length === 0) {
      loadMachines();
    }
  }, [machines.length, loadMachines]);

  const handleEdit = useCallback((machine: Machine) => {
    setEditingId(machine.id);
    setWeeklyTarget(machine.weeklyTargetRatio);
    setMonthlyTarget(machine.monthlyTargetRatio);
    clearError();
  }, [clearError]);

  const handleSave = useCallback(() => {
    if (editingId) {
      updateMachineTarget(editingId, weeklyTarget, monthlyTarget);
      if (!useMachineStore.getState().error) {
        setEditingId(null);
      }
    }
  }, [editingId, weeklyTarget, monthlyTarget, updateMachineTarget]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    clearError();
  }, [clearError]);

  // Define columns with access to editing state
  const columns = useMemo<ColumnDef<Machine, unknown>[]>(() => [
    {
      id: 'select',
      header: 'Select',
      enableSorting: false,
      cell: ({ row }) => {
        const machine = row.original;
        const isEditing = editingId === machine.id;

        return isEditing ? (
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1 text-xs focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleEdit(machine)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Select
          </button>
        );
      },
      meta: { className: 'text-center' },
    },
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
      accessorKey: 'weeklyTargetRatio',
      header: () => <span>Weekly Target<br/>Ratio(%)</span>,
      enableSorting: true,
      cell: ({ row }) => {
        const machine = row.original;
        const isEditing = editingId === machine.id;

        return isEditing ? (
          <input
            type="number"
            value={weeklyTarget}
            onChange={(e) => setWeeklyTarget(Number(e.target.value))}
            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
          />
        ) : (
          <span>{machine.weeklyTargetRatio}</span>
        );
      },
      meta: { className: 'text-center bg-green-100 dark:bg-green-900/30' },
    },
    {
      accessorKey: 'monthlyTargetRatio',
      header: () => <span>Monthly Target<br/>Ratio(%)</span>,
      enableSorting: true,
      cell: ({ row }) => {
        const machine = row.original;
        const isEditing = editingId === machine.id;

        return isEditing ? (
          <input
            type="number"
            value={monthlyTarget}
            onChange={(e) => setMonthlyTarget(Number(e.target.value))}
            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            max="100"
          />
        ) : (
          <span>{machine.monthlyTargetRatio}</span>
        );
      },
      meta: { className: 'text-center bg-green-100 dark:bg-green-900/30' },
    },
  ], [editingId, weeklyTarget, monthlyTarget, handleEdit, handleSave, handleCancel]);

  return (
    <div className="h-full bg-gray-100 dark:bg-gray-900 p-6 transition-colors flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center gap-3 mb-6 flex-shrink-0">
          <Settings className="w-8 h-8 text-gray-700 dark:text-gray-300" aria-hidden="true" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">TMOT Machine Setup</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors flex flex-col flex-1 min-h-0">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 flex-shrink-0">Target Ratio Setting</h2>

          {/* Error display */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex-shrink-0" role="alert">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-300"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Group Filter */}
          <div className="mb-4 flex items-center gap-2 flex-shrink-0">
            <label htmlFor="setup-group-filter" className="font-medium text-gray-700 dark:text-gray-200">Group:</label>
            <select
              id="setup-group-filter"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filter machines by group"
            >
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>

          {filteredMachines.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No machines found for the selected group.
            </div>
          ) : (
            <div className="flex-1 overflow-auto min-h-0">
              <DataTable
                data={filteredMachines}
                columns={columns}
                enableSorting={true}
                stickyHeader={true}
                headerClassName="bg-green-600 dark:bg-green-700 text-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(MachineSetup);
