// src/pages/MachineStatusPage.tsx
import MachineStatusTable from '../components/MachineStatusTable';

const MachineStatusPage = () => {
  return (
    <div className="h-full bg-gray-100 dark:bg-gray-900 p-4 transition-colors flex flex-col">
      {/* Green Header Bar */}
      <div className="bg-green-600 dark:bg-green-700 text-white px-4 py-2 mb-4 rounded">
        <h1 className="text-xl font-semibold">Machine Monitoring</h1>
      </div>

      {/* Machine Status Tables */}
      <div className="flex-1 overflow-auto">
        <MachineStatusTable />
      </div>
    </div>
  );
};

export default MachineStatusPage;
