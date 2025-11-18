// src/components/MachineStatusTable.tsx
import { useEffect } from 'react';
import { useMachineStore } from '../store/useMachineStore';
import { getStateColor, getRatioColor } from '../utils/helpers';
import { Loader2 } from 'lucide-react';

const MachineStatusTable = () => {
  const { machines, selectedGroup, loadMachines, isLoading } = useMachineStore();
  
  useEffect(() => {
    loadMachines();
  }, []);
  
  const filteredMachines = selectedGroup === 'ALL'
    ? machines
    : machines.filter(m => m.group === selectedGroup);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="px-4 py-3 text-left border-r border-gray-600">Group</th>
              <th className="px-4 py-3 text-left border-r border-gray-600">Machine Name</th>
              <th className="px-4 py-3 text-center border-r border-gray-600">State</th>
              <th className="px-4 py-3 text-center border-r border-gray-600">Rework</th>
              <th className="px-4 py-3 text-center border-r border-gray-600">STOP(Hours)</th>
              <th className="px-4 py-3 text-center border-r border-gray-600">Weekly Actual<br/>Ratio(%)</th>
              <th className="px-4 py-3 text-center border-r border-gray-600">Weekly Target<br/>Ratio(%)</th>
              <th className="px-4 py-3 text-center border-r border-gray-600">Monthly Actual<br/>Ratio(%)</th>
              <th className="px-4 py-3 text-center">Monthly Target<br/>Ratio(%)</th>
            </tr>
          </thead>
          <tbody>
            {filteredMachines.map((machine) => (
              <tr key={machine.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 border-r border-gray-200">{machine.group}</td>
                <td className="px-4 py-3 border-r border-gray-200">{machine.machineName}</td>
                <td className={`px-4 py-3 text-center border-r border-gray-200 font-semibold ${getStateColor(machine.state)}`}>
                  {machine.state}
                </td>
                <td className="px-4 py-3 text-center border-r border-gray-200">{machine.rework}</td>
                <td className="px-4 py-3 text-center border-r border-gray-200">{machine.stopHours.toFixed(2)}</td>
                <td className={`px-4 py-3 text-center border-r border-gray-200 font-medium ${getRatioColor(machine.weeklyActualRatio, machine.weeklyTargetRatio)}`}>
                  {machine.weeklyActualRatio.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center border-r border-gray-200">{machine.weeklyTargetRatio}</td>
                <td className={`px-4 py-3 text-center border-r border-gray-200 font-medium ${getRatioColor(machine.monthlyActualRatio, machine.monthlyTargetRatio)}`}>
                  {machine.monthlyActualRatio.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">{machine.monthlyTargetRatio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MachineStatusTable;
