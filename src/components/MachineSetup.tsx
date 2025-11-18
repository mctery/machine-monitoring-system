// src/components/MachineSetup.tsx
import { useState, useEffect } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { Settings, Save, X } from 'lucide-react';

const MachineSetup = () => {
  const { machines, selectedGroup, loadMachines, updateMachineTarget } = useMachineStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weeklyTarget, setWeeklyTarget] = useState(50);
  const [monthlyTarget, setMonthlyTarget] = useState(50);
  
  useEffect(() => {
    if (machines.length === 0) {
      loadMachines();
    }
  }, []);
  
  const filteredMachines = selectedGroup === 'ALL'
    ? machines
    : machines.filter(m => m.group === selectedGroup);
  
  const handleEdit = (machine: typeof machines[0]) => {
    setEditingId(machine.id);
    setWeeklyTarget(machine.weeklyTargetRatio);
    setMonthlyTarget(machine.monthlyTargetRatio);
  };
  
  const handleSave = () => {
    if (editingId) {
      updateMachineTarget(editingId, weeklyTarget, monthlyTarget);
      setEditingId(null);
    }
  };
  
  const handleCancel = () => {
    setEditingId(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-800">TMOT Machine Setup</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Target Ratio Setting</h2>
          
          {/* Group Filter */}
          <div className="mb-4 flex items-center gap-2">
            <label className="font-medium text-gray-700">Group:</label>
            <select
              value={selectedGroup}
              onChange={(e) => useMachineStore.getState().setSelectedGroup(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">ALL</option>
              {Array.from(new Set(machines.map(m => m.group))).map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="px-4 py-3 text-center border border-green-700">Select</th>
                  <th className="px-4 py-3 text-left border border-green-700">Group</th>
                  <th className="px-4 py-3 text-left border border-green-700">Machine Name</th>
                  <th className="px-4 py-3 text-center border border-green-700">Weekly Target<br/>Ratio(%)</th>
                  <th className="px-4 py-3 text-center border border-green-700">Monthly Target<br/>Ratio(%)</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.map((machine) => (
                  <tr key={machine.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-center border border-gray-300">
                      {editingId === machine.id ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={handleSave}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center gap-1 text-xs"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center gap-1 text-xs"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(machine)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-xs"
                        >
                          Select
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-300">{machine.group}</td>
                    <td className="px-4 py-3 border border-gray-300">{machine.machineName}</td>
                    <td className="px-4 py-3 text-center border border-gray-300 bg-green-100">
                      {editingId === machine.id ? (
                        <input
                          type="number"
                          value={weeklyTarget}
                          onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0"
                          max="100"
                        />
                      ) : (
                        machine.weeklyTargetRatio
                      )}
                    </td>
                    <td className="px-4 py-3 text-center border border-gray-300 bg-green-100">
                      {editingId === machine.id ? (
                        <input
                          type="number"
                          value={monthlyTarget}
                          onChange={(e) => setMonthlyTarget(Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          min="0"
                          max="100"
                        />
                      ) : (
                        machine.monthlyTargetRatio
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineSetup;
