// src/pages/MachineStatusPage.tsx
import { motion } from 'framer-motion';
import MachineStatusTable from '../components/MachineStatusTable';
import PageTransition, { fadeInUp, staggerContainer } from '../components/PageTransition';

const MachineStatusPage = () => {
  return (
    <PageTransition className="h-full bg-gray-100 dark:bg-gray-900 p-4 transition-colors flex flex-col overflow-hidden">
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="flex flex-col h-full"
      >
        {/* Green Header Bar */}
        <motion.div
          variants={fadeInUp}
          className="flex-shrink-0 bg-green-600 dark:bg-green-700 text-white px-4 py-2 mb-4 rounded"
        >
          <h1 className="text-xl font-semibold">Machine Monitoring</h1>
        </motion.div>

        {/* Machine Status Tables */}
        <motion.div variants={fadeInUp} className="flex-1 min-h-0">
          <MachineStatusTable />
        </motion.div>
      </motion.div>
    </PageTransition>
  );
};

export default MachineStatusPage;
