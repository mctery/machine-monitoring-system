// src/components/MachineSetup.tsx
import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Settings, Plus, Save, X, Loader2, AlertCircle, Database, Trash2 } from 'lucide-react';
import DataTable from './DataTable';
import { machineSettingsApi, MachineSettingsData } from '../lib/api';

// Editable Input Component (prevents focus loss)
interface EditableInputProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
  className?: string;
}

const EditableInput = memo(({ value, onChange, type = 'text', min, max, className }: EditableInputProps) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <input
      ref={inputRef}
      type={type}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      min={min}
      max={max}
      className={className}
    />
  );
});

// Autocomplete Component
interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}

const Autocomplete = memo(({ value, onChange, suggestions, placeholder }: AutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value with prop
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const filteredSuggestions = useMemo(() => {
    if (localValue) {
      return suggestions.filter(s =>
        s.toLowerCase().includes(localValue.toLowerCase())
      );
    }
    return suggestions;
  }, [localValue, suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Commit value when clicking outside
        if (localValue !== value) {
          onChange(localValue);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [localValue, value, onChange]);

  const handleSelect = (suggestion: string) => {
    setLocalValue(suggestion);
    onChange(suggestion);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Small delay to allow click on suggestion
    setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 150);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              onMouseDown={() => handleSelect(suggestion)}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 ${
                suggestion === localValue ? 'bg-blue-50 dark:bg-blue-800' : ''
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      {isOpen && localValue && !suggestions.includes(localValue) && (
        <div className="absolute z-50 w-full mt-1 px-3 py-2 bg-green-100 dark:bg-green-800 border border-green-300 dark:border-green-600 rounded text-green-700 dark:text-green-300 text-sm">
          + Create new group "{localValue}"
        </div>
      )}
    </div>
  );
});

// Dialog Component for Add
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Dialog = ({ isOpen, onClose, title, children }: DialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Confirm Dialog Component
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isLoading?: boolean;
}

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, isLoading }: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Form Component
interface AddFormProps {
  availableGroups: string[];
  onSubmit: (data: Omit<MachineSettingsData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const AddForm = ({ availableGroups, onSubmit, onCancel, isLoading }: AddFormProps) => {
  const [machineName, setMachineName] = useState('');
  const [groupName, setGroupName] = useState(availableGroups[0] || '');
  const [weeklyTarget, setWeeklyTarget] = useState(50);
  const [monthlyTarget, setMonthlyTarget] = useState(50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ machineName, groupName, weeklyTarget, monthlyTarget });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Machine Name
        </label>
        <input
          type="text"
          value={machineName}
          onChange={(e) => setMachineName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          placeholder="Enter machine name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Group
        </label>
        <Autocomplete
          value={groupName}
          onChange={setGroupName}
          suggestions={availableGroups}
          placeholder="Type to search or add new group"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Weekly Target (%)
          </label>
          <input
            type="number"
            value={weeklyTarget}
            onChange={(e) => setWeeklyTarget(Number(e.target.value))}
            min="0"
            max="100"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Monthly Target (%)
          </label>
          <input
            type="number"
            value={monthlyTarget}
            onChange={(e) => setMonthlyTarget(Number(e.target.value))}
            min="0"
            max="100"
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create
        </button>
      </div>
    </form>
  );
};

const MachineSetup = () => {
  const [settings, setSettings] = useState<MachineSettingsData[]>([]);
  const [groups, setGroups] = useState<string[]>(['All']);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline editing states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMachineName, setEditMachineName] = useState('');
  const [editGroupName, setEditGroupName] = useState('');
  const [editWeeklyTarget, setEditWeeklyTarget] = useState(50);
  const [editMonthlyTarget, setEditMonthlyTarget] = useState(50);

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<MachineSettingsData | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [settingsData, groupsData] = await Promise.all([
        machineSettingsApi.getAll(),
        machineSettingsApi.getGroups()
      ]);
      setSettings(settingsData);
      setGroups(groupsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize database
  const handleInitialize = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await machineSettingsApi.initialize();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize');
    } finally {
      setIsSubmitting(false);
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter settings by group
  const filteredSettings = useMemo(() => {
    if (selectedGroup === 'All') return settings;
    return settings.filter(s => s.groupName === selectedGroup);
  }, [settings, selectedGroup]);

  // Inline edit handlers
  const handleStartEdit = useCallback((machine: MachineSettingsData) => {
    setEditingId(machine.id);
    setEditMachineName(machine.machineName);
    setEditGroupName(machine.groupName);
    setEditWeeklyTarget(machine.weeklyTarget);
    setEditMonthlyTarget(machine.monthlyTarget);
    setError(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingId === null) return;
    setIsSubmitting(true);
    try {
      await machineSettingsApi.update(editingId, {
        machineName: editMachineName,
        groupName: editGroupName,
        weeklyTarget: editWeeklyTarget,
        monthlyTarget: editMonthlyTarget
      });
      await loadData();
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingId, editMachineName, editGroupName, editWeeklyTarget, editMonthlyTarget, loadData]);

  // Create handler
  const handleCreate = useCallback(async (data: Omit<MachineSettingsData, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    try {
      await machineSettingsApi.create(data);
      await loadData();
      setIsAddDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setIsSubmitting(false);
    }
  }, [loadData]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!selectedMachine) return;
    setIsSubmitting(true);
    try {
      await machineSettingsApi.delete(selectedMachine.id);
      await loadData();
      setIsDeleteDialogOpen(false);
      setSelectedMachine(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedMachine, loadData]);

  const openDeleteDialog = useCallback((machine: MachineSettingsData) => {
    setSelectedMachine(machine);
    setIsDeleteDialogOpen(true);
  }, []);

  // Available groups for dropdown
  const availableGroups = useMemo(() => groups.filter(g => g !== 'All'), [groups]);

  // Table columns with inline editing
  const columns = useMemo<ColumnDef<MachineSettingsData, unknown>[]>(() => [
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const machine = row.original;
        const isEditing = editingId === machine.id;

        return isEditing ? (
          <div className="flex gap-1 justify-center">
            <button
              onClick={handleCancelEdit}
              className="p-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1 text-xs"
              title="Save"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
            <button
              onClick={() => openDeleteDialog(machine)}
              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1 justify-center">
            <button
              onClick={() => handleStartEdit(machine)}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
            >
              Select
            </button>
          </div>
        );
      },
      meta: { className: 'text-center w-36' },
    },
    {
      accessorKey: 'groupName',
      header: 'Group',
      enableSorting: true,
      cell: ({ row }) => {
        const machine = row.original;
        const isEditing = editingId === machine.id;

        return isEditing ? (
          <Autocomplete
            value={editGroupName}
            onChange={setEditGroupName}
            suggestions={availableGroups}
            placeholder="Type to search or add new"
          />
        ) : (
          <span>{machine.groupName}</span>
        );
      },
      meta: { className: 'text-left' },
    },
    {
      accessorKey: 'machineName',
      header: 'Machine Name',
      enableSorting: true,
      cell: ({ row }) => {
        const machine = row.original;
        const isEditing = editingId === machine.id;

        return isEditing ? (
          <EditableInput
            value={editMachineName}
            onChange={setEditMachineName}
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span>{machine.machineName}</span>
        );
      },
      meta: { className: 'text-left' },
    },
    {
      accessorKey: 'weeklyTarget',
      header: () => <span>Weekly Target<br/>Ratio(%)</span>,
      enableSorting: true,
      cell: ({ row }) => {
        const machine = row.original;
        const isEditing = editingId === machine.id;

        return isEditing ? (
          <EditableInput
            type="number"
            value={String(editWeeklyTarget)}
            onChange={(val) => setEditWeeklyTarget(Number(val))}
            min={0}
            max={100}
            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span>{machine.weeklyTarget}</span>
        );
      },
      meta: { className: 'text-center bg-green-100 dark:bg-green-900/30' },
    },
    {
      accessorKey: 'monthlyTarget',
      header: () => <span>Monthly Target<br/>Ratio(%)</span>,
      enableSorting: true,
      cell: ({ row }) => {
        const machine = row.original;
        const isEditing = editingId === machine.id;

        return isEditing ? (
          <EditableInput
            type="number"
            value={String(editMonthlyTarget)}
            onChange={(val) => setEditMonthlyTarget(Number(val))}
            min={0}
            max={100}
            className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <span>{machine.monthlyTarget}</span>
        );
      },
      meta: { className: 'text-center bg-green-100 dark:bg-green-900/30' },
    },
  ], [editingId, editMachineName, editGroupName, editWeeklyTarget, editMonthlyTarget, availableGroups, isSubmitting, handleStartEdit, handleSaveEdit, handleCancelEdit, openDeleteDialog]);

  return (
    <div className="h-full bg-gray-100 dark:bg-gray-900 p-6 transition-colors flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">TMOT Machine Setup</h1>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Target Ratio Setting</h2>
            <div className="flex gap-2">
              {settings.length === 0 && !isLoading && (
                <button
                  onClick={handleInitialize}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  Initialize Data
                </button>
              )}
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Machine
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Group Filter */}
          <div className="mb-4 flex items-center gap-2 flex-shrink-0">
            <label className="font-medium text-gray-700 dark:text-gray-200">Group:</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              {groups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              ({filteredSettings.length} machines)
            </span>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredSettings.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <Database className="w-12 h-12 mb-2" />
              <p>No machines found.</p>
              {settings.length === 0 && (
                <p className="text-sm mt-1">Click "Initialize Data" to add sample machines.</p>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-auto min-h-0">
              <DataTable
                data={filteredSettings}
                columns={columns}
                enableSorting={true}
                stickyHeader={true}
                headerClassName="bg-green-600 dark:bg-green-700 text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title="Add New Machine"
      >
        <AddForm
          availableGroups={availableGroups}
          onSubmit={handleCreate}
          onCancel={() => setIsAddDialogOpen(false)}
          isLoading={isSubmitting}
        />
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedMachine(null); }}
        onConfirm={handleDelete}
        title="Delete Machine"
        message={`Are you sure you want to delete "${selectedMachine?.machineName}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default memo(MachineSetup);
