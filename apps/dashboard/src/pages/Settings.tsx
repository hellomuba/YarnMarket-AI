import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">System configuration and preferences</p>
      </div>

      <div className="text-center py-12">
        <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Settings panel will appear here</p>
        <p className="text-gray-400 text-sm mt-2">
          Configure system settings and preferences
        </p>
      </div>
    </div>
  );
};
