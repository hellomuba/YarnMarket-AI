import React from 'react';
import { MessageSquare } from 'lucide-react';

export const Messages: React.FC<{ selectedMerchant: any }> = ({ selectedMerchant }) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">WhatsApp message monitoring and management</p>
        {selectedMerchant && (
          <p className="text-sm text-gray-500 mt-2">
            Viewing messages for: {selectedMerchant.business_name}
          </p>
        )}
      </div>

      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Messages will appear here</p>
        <p className="text-gray-400 text-sm mt-2">
          Connect to the backend API to see real message data
        </p>
      </div>
    </div>
  );
};
