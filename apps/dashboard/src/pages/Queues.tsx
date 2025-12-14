import React from 'react';
import { Activity } from 'lucide-react';

export const Queues: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
        <p className="text-gray-600">Message queue monitoring and management</p>
      </div>

      <div className="text-center py-12">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Queue information will appear here</p>
        <p className="text-gray-400 text-sm mt-2">
          Connect to the backend API to see queue status
        </p>
      </div>
    </div>
  );
};
