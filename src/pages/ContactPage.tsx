// src/pages/ContactPage.tsx
import { Mail, Phone, MapPin, Building } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact</h1>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Building className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Company Information</h2>
                <p className="text-gray-700">
                  <strong>True Mold (Thailand) Co., Ltd.</strong><br />
                  Bridgestone Group
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">System</h2>
                <p className="text-gray-700">
                  TMOT Machine Monitoring System<br />
                  Real-time production monitoring and analytics
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Support</h2>
              <p className="text-gray-700">
                For technical support or questions about the system,<br />
                please contact your system administrator.
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
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
