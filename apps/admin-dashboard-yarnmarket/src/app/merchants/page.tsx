'use client';

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
  AlertCircle,
  Power
} from 'lucide-react';
import { toast } from 'sonner';
import { merchantsApi } from '@/lib/api';
import { Merchant } from '@/types';

interface CreateMerchantRequest {
  business_name: string;
  contact_phone: string;
  business_type: string;
  contact_email?: string;
  business_address?: string;
  password?: string;
}

const MerchantCard: React.FC<{
  merchant: Merchant;
  onEdit: (merchant: Merchant) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, newStatus: string) => void;
}> = ({ merchant, onEdit, onDelete, onToggleStatus }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'inactive':
        return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      default:
        return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
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
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{merchant.business_name}</h3>
          <p className="text-sm text-slate-400 mt-1">{merchant.business_type}</p>
          
          <div className="flex items-center mt-3 space-x-4">
            <div className="flex items-center text-sm text-slate-400">
              <Phone className="h-4 w-4 mr-1" />
              {merchant.phone_number || merchant.contact_phone}
            </div>
            <div className="flex items-center text-sm text-slate-400">
              <MessageSquare className="h-4 w-4 mr-1" />
              {merchant.total_messages || 0} messages
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(merchant.status)}`}>
              {getStatusIcon(merchant.status)}
              <span className="ml-1">{merchant.status}</span>
            </span>
            
            <div className="text-xs text-slate-500">
              Created {merchant.created_at ? new Date(merchant.created_at).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggleStatus(merchant.id, merchant.status === 'active' ? 'inactive' : 'active')}
            className={`p-2 rounded-md transition-colors ${
              merchant.status === 'active'
                ? 'text-green-400 hover:text-green-300 hover:bg-slate-700'
                : 'text-slate-400 hover:text-green-400 hover:bg-slate-700'
            }`}
            title={merchant.status === 'active' ? 'Deactivate merchant' : 'Activate merchant'}
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(merchant)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(merchant.id)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-md transition-colors"
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
    business_name: merchant?.business_name || '',
    contact_phone: merchant?.phone_number || merchant?.contact_phone || '',
    business_type: merchant?.business_type || '',
    contact_email: merchant?.email || merchant?.contact_email || '',
    business_address: merchant?.business_address || '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Generate secure password
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Fill remaining characters
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle password
    const shuffled = password.split('').sort(() => Math.random() - 0.5).join('');
    setFormData({ ...formData, password: shuffled });
    setShowPassword(true);
    toast.success('Password generated!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    setFormData({ business_name: '', contact_phone: '', business_type: '', contact_email: '', business_address: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">
          {merchant ? 'Edit Merchant' : 'Create New Merchant'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Business Name</label>
            <input
              type="text"
              required
              value={formData.business_name}
              onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300">Phone Number</label>
            <input
              type="tel"
              required
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+234..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300">Email (Optional)</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300">Business Address (Optional)</label>
            <input
              type="text"
              value={formData.business_address}
              onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Business address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300">Business Type</label>
            <select
              value={formData.business_type}
              onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select business type</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="food">Food & Beverages</option>
              <option value="services">Services</option>
              <option value="other">Other</option>
            </select>
          </div>

          {!merchant && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="flex space-x-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password or generate"
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formData.password && (
                <p className="mt-2 text-xs text-green-400">
                  💾 Remember to save this password! It won't be shown again.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
            >
              {merchant ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function MerchantsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | undefined>();

  const queryClient = useQueryClient();

  const { data: merchants, isLoading } = useQuery({
    queryKey: ['merchants'],
    queryFn: merchantsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateMerchantRequest) => merchantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      toast.success('Merchant created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create merchant');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateMerchantRequest }) => 
      merchantsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      toast.success('Merchant updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update merchant');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => merchantsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] });
      toast.success('Merchant deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete merchant');
    },
  });

  const handleCreateOrUpdate = (data: CreateMerchantRequest) => {
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

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this merchant?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: number, newStatus: string) => {
    const merchant = merchants?.find(m => m.id === id);
    if (!merchant) return;

    updateMutation.mutate({
      id,
      data: {
        business_name: merchant.business_name,
        contact_phone: merchant.phone_number || merchant.contact_phone || '',
        business_type: merchant.business_type || '',
        contact_email: merchant.email || merchant.contact_email,
        business_address: merchant.business_address,
        status: newStatus,
      } as any,
    });
  };

  const filteredMerchants = merchants?.filter(merchant => {
    const matchesSearch = merchant.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (merchant.phone_number || merchant.contact_phone)?.includes(searchTerm) ||
                         merchant.business_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter || merchant.onboarding_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-600 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded"></div>
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
          <h1 className="text-2xl font-bold text-white">Merchants</h1>
          <p className="text-slate-400">{merchants?.length || 0} merchants total</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Merchant
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search merchants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="new">New</option>
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
            onToggleStatus={handleToggleStatus}
          />
        ))}
      </div>

      {filteredMerchants?.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No merchants found</p>
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
}
