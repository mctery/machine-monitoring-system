// src/components/GroupFilter.tsx
import { memo } from 'react';
import { Filter } from 'lucide-react';
import { useMachineStore, useGroups } from '../store/useMachineStore';

const GroupFilter = () => {
  const { selectedGroup, setSelectedGroup } = useMachineStore();
  const groups = useGroups();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 transition-colors">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" aria-hidden="true" />
            <label htmlFor="group-filter" className="font-semibold text-gray-700 dark:text-gray-200">
              Group:
            </label>
          </div>

          <select
            id="group-filter"
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

        <div className="flex items-center gap-6 text-sm" role="legend" aria-label="Status legend">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-400 rounded border border-gray-300 dark:border-gray-600" aria-hidden="true"></div>
            <span className="text-gray-700 dark:text-gray-300">STOP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-300 rounded border border-gray-300 dark:border-gray-600" aria-hidden="true"></div>
            <span className="text-gray-700 dark:text-gray-300">RUN</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-300 rounded border border-gray-300 dark:border-gray-600" aria-hidden="true"></div>
            <span className="text-gray-700 dark:text-gray-300">Below Target</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(GroupFilter);
