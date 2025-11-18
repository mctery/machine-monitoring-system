// src/pages/MachineStatusPage.tsx
import { useEffect } from 'react';
import GroupFilter from '../components/GroupFilter';
import MachineStatusTable from '../components/MachineStatusTable';

const MachineStatusPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Machine Monitoring</h1>
        <GroupFilter />
        <MachineStatusTable />
      </div>
    </div>
  );
};

export default MachineStatusPage;
