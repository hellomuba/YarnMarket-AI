import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api';
import { Merchant, CreateMerchantRequest } from '../types';

const MerchantCard: React.FC<{
  merchant: Merchant;
  onEdit: (merchant: Merchant) => void;
  onDelete: (id: string) => void;
}> = ({ merchant, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'inactive':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{merchant.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{merchant.business_type}</p>
          
          <div className="flex items-center mt-3 space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Phone className="h-4 w-4 mr-1" />
              {merchant.phone_number}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MessageSquare className="h-4 w-4 mr-1" />
              {merchant.message_count || 0} messages
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(merchant.status)}`}>
              {getStatusIcon(merchant.status)}
              <span className="ml-1">{merchant.status}</span>
            </span>
            
            <div className="text-xs text-gray-500">
              Created {new Date(merchant.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(merchant)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(merchant.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-md"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateMerchantModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMerchantRequest) => void;
  merchant?: Merchant;
}> = ({ isOpen, onClose, onSubmit, merchant }) => {
  const [formData, setFormData] = useState<CreateMerchantRequest>({
    name: merchant?.name || '',
    phone_number: merchant?.phone_number || '',
    business_type: merchant?.business_type || '',
    status: merchant?.status || 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({ name: '', phone_number: '', business_type: '', status: 'active' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {merchant ? 'Edit Merchant' : 'Create New Merchant'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              required
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+234..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Type</label>
            <select
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select business type</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="food">Food & Beverages</option>
              <option value="services">Services</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
            >
              {merchant ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Merchants: React.FC<{ onMerchantSelect: any }> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | undefined>();

  const queryClient = useQueryClient();

  const { data: merchants, isLoading } = useQuery({
    queryKey: ['merchants'],
    queryFn: () => api.merchants.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.merchants.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      toast.success('Merchant created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create merchant');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.merchants.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      toast.success('Merchant updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update merchant');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.merchants.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      toast.success('Merchant deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete merchant');
    },
  });

  const handleCreateOrUpdate = (data: any) => {
    if (editingMerchant) {
      updateMutation.mutate({ id: editingMerchant.id, data });
    } else {
      createMutation.mutate(data);
    }
    setEditingMerchant(undefined);
  };

  const handleEdit = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this merchant?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredMerchants = merchants?.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.phone_number.includes(searchTerm) ||
                         merchant.business_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchants</h1>
          <p className="text-gray-600">{merchants?.length || 0} merchants total</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Merchant
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search merchants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Merchants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMerchants?.map((merchant) => (
          <MerchantCard
            key={merchant.id}
            merchant={merchant}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredMerchants?.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No merchants found</p>
        </div>
      )}

      <CreateMerchantModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingMerchant(undefined);
        }}
        onSubmit={handleCreateOrUpdate}
        merchant={editingMerchant}
      />
    </div>
  );
};
