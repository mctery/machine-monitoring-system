// src/components/GroupFilter.tsx
import { Filter } from 'lucide-react';
import { useMachineStore } from '../store/useMachineStore';

const GroupFilter = () => {
  const { selectedGroup, setSelectedGroup, machines } = useMachineStore();
  
  const groups = ['ALL', ...Array.from(new Set(machines.map(m => m.group)))];
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <label className="font-semibold text-gray-700">Group:</label>
          </div>
          
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-400 rounded border border-gray-300"></div>
            <span className="text-gray-700">STOP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-300 rounded border border-gray-300"></div>
            <span className="text-gray-700">RUN</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-300 rounded border border-gray-300"></div>
            <span className="text-gray-700">Below Target</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupFilter;
