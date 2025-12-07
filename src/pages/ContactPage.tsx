// src/pages/ContactPage.tsx
import { MapPin, Building } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="h-full bg-gray-100 dark:bg-gray-900 p-6 transition-colors overflow-auto">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 transition-colors">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Contact</h1>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Building className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Company Information</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>True Mold (Thailand) Co., Ltd.</strong><br />
                  Bridgestone Group
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">System</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  TMOT Machine Monitoring System<br />
                  Real-time production monitoring and analytics
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Support</h2>
              <p className="text-gray-700 dark:text-gray-300">
                For technical support or questions about the system,<br />
                please contact your system administrator.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Copyright © 2023 True Mold (Thailand) Co., Ltd.<br />
                All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
