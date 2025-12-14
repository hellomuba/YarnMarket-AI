import React from 'react';
import { MessageCircle } from 'lucide-react';

export const Conversations: React.FC<{ selectedMerchant: any }> = ({ selectedMerchant }) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-600">WhatsApp conversation monitoring</p>
        {selectedMerchant && (
          <p className="text-sm text-gray-500 mt-2">
            Viewing conversations for: {selectedMerchant.business_name}
          </p>
        )}
      </div>

      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Conversations will appear here</p>
        <p className="text-gray-400 text-sm mt-2">
          Connect to the backend API to see real conversation data
        </p>
      </div>
    </div>
  );
};
