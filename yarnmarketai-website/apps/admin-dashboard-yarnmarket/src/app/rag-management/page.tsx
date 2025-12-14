'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Database,
  Search,
  Upload,
  Download,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileText,
  Image,
  Zap,
  BarChart3,
  RefreshCw,
  Eye,
  AlertCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import ProductImportExport from '../../components/ProductImportExport';
import RAGConfiguration from '../../components/RAGConfiguration';

interface RAGCollection {
  merchant_id: string;
  merchant_name: string;
  collection_name: string;
  document_count: number;
  embedding_model: string;
  last_updated: string;
  status: 'healthy' | 'indexing' | 'error';
  similarity_threshold: number;
  search_performance: {
    avg_query_time: number;
    total_queries: number;
    cache_hit_rate: number;
  };
}

interface RAGSystemMetrics {
  total_collections: number;
  total_documents: number;
  total_embeddings: number;
  avg_query_time: number;
  system_status: 'healthy' | 'degraded' | 'error';
  active_merchants: number;
}

const mockRAGCollections: RAGCollection[] = [
  {
    merchant_id: '1',
    merchant_name: 'Tech Solutions Ltd',
    collection_name: 'tech_solutions_products',
    document_count: 245,
    embedding_model: 'all-MiniLM-L6-v2',
    last_updated: '2024-01-20T14:30:00Z',
    status: 'healthy',
    similarity_threshold: 0.7,
    search_performance: {
      avg_query_time: 120,
      total_queries: 1500,
      cache_hit_rate: 78
    }
  },
  {
    merchant_id: '2', 
    merchant_name: 'Fashion Hub',
    collection_name: 'fashion_hub_products',
    document_count: 189,
    embedding_model: 'all-MiniLM-L6-v2',
    last_updated: '2024-01-20T16:45:00Z',
    status: 'indexing',
    similarity_threshold: 0.75,
    search_performance: {
      avg_query_time: 95,
      total_queries: 890,
      cache_hit_rate: 82
    }
  }
];

const mockRAGMetrics: RAGSystemMetrics = {
  total_collections: 15,
  total_documents: 3420,
  total_embeddings: 3420000,
  avg_query_time: 108,
  system_status: 'healthy',
  active_merchants: 12
};

export default function RAGManagementPage() {
  const [selectedCollection, setSelectedCollection] = useState<RAGCollection | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'import-export' | 'configuration'>('overview');
  
  const queryClient = useQueryClient();

  // Mock queries (replace with real API calls)
  const { data: ragMetrics } = useQuery({
    queryKey: ['rag-metrics'],
    queryFn: async () => mockRAGMetrics,
    refetchInterval: 30000
  });

  const { data: collections } = useQuery({
    queryKey: ['rag-collections'],
    queryFn: async () => mockRAGCollections,
    refetchInterval: 10000
  });

  const reindexMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      // Simulate reindexing
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { status: 'success' };
    },
    onSuccess: () => {
      toast.success('Collection reindexing started');
      queryClient.invalidateQueries({ queryKey: ['rag-collections'] });
    }
  });

  const handleReindex = (collectionId: string) => {
    reindexMutation.mutate(collectionId);
  };

  const handleViewDetails = (collection: RAGCollection) => {
    setSelectedCollection(collection);
    setShowDetails(true);
  };

  const handleConfigure = (collection: RAGCollection) => {
    setSelectedMerchant(collection.merchant_id);
    setActiveTab('configuration');
  };

  const getStatusColor = (status: RAGCollection['status']) => {
    switch (status) {
      case 'healthy': return 'bg-green-600/20 text-green-400';
      case 'indexing': return 'bg-yellow-600/20 text-yellow-400';
      case 'error': return 'bg-red-600/20 text-red-400';
      default: return 'bg-slate-600/20 text-slate-400';
    }
  };

  const getStatusIcon = (status: RAGCollection['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'indexing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">RAG System Management</h1>
          <p className="text-slate-400 mt-1">Manage merchant product embeddings and vector search</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['rag-collections', 'rag-metrics'] })}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh All</span>
          </button>
          
          <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === 'overview' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('import-export')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === 'import-export' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Import/Export
            </button>
            <button
              onClick={() => setActiveTab('configuration')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === 'configuration' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Configuration
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <Database className="w-10 h-10 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{ragMetrics?.total_collections}</p>
                  <p className="text-slate-400 text-sm">Total Collections</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-10 h-10 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{ragMetrics?.total_documents.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">Total Documents</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-10 h-10 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{ragMetrics?.avg_query_time}ms</p>
                  <p className="text-slate-400 text-sm">Avg Query Time</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex items-center space-x-3">
                <Activity className="w-10 h-10 text-purple-400" />
                <div>
                  <p className={`text-2xl font-bold ${
                    ragMetrics?.system_status === 'healthy' ? 'text-green-400' :
                    ragMetrics?.system_status === 'degraded' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {ragMetrics?.system_status}
                  </p>
                  <p className="text-slate-400 text-sm">System Status</p>
                </div>
              </div>
            </div>
          </div>

          {/* RAG Collections Table */}
          <div className="bg-slate-800 rounded-lg">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Merchant RAG Collections</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {collections?.map((collection) => (
                    <tr key={collection.merchant_id} className="hover:bg-slate-750">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">{collection.merchant_name}</div>
                          <div className="text-xs text-slate-400">{collection.collection_name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">{collection.document_count}</div>
                          <div className="text-xs text-slate-400">Model: {collection.embedding_model}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-white">{collection.search_performance.avg_query_time}ms avg</div>
                          <div className="text-xs text-slate-400">{collection.search_performance.cache_hit_rate}% cache hit</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(collection.status)}`}>
                          {getStatusIcon(collection.status)}
                          <span className="capitalize">{collection.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(collection)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReindex(collection.merchant_id)}
                            disabled={reindexMutation.isPending}
                            className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                            title="Reindex"
                          >
                            <RefreshCw className={`w-4 h-4 ${
                              reindexMutation.isPending ? 'animate-spin' : ''
                            }`} />
                          </button>
                          <button
                            onClick={() => handleConfigure(collection)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Configure"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'import-export' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Product Import/Export</h2>
            <p className="text-slate-400">Upload product catalogs and manage merchant data</p>
          </div>
          
          {selectedMerchant ? (
            <ProductImportExport 
              merchantId={selectedMerchant}
              onImportComplete={(jobId) => {
                toast.success('Import job queued successfully');
                queryClient.invalidateQueries({ queryKey: ['rag-collections'] });
              }}
            />
          ) : (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Select a Merchant</h3>
              <p className="text-slate-400 mb-4">Choose a merchant from the collections table above to manage their product imports and exports.</p>
              <button
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
              >
                View Collections
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'configuration' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">RAG Configuration</h2>
            <p className="text-slate-400">Configure embedding models and search settings</p>
          </div>
          
          {selectedMerchant ? (
            <RAGConfiguration 
              merchantId={selectedMerchant}
              onConfigChange={(config) => {
                console.log('RAG config changed:', config);
              }}
            />
          ) : (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Select a Merchant</h3>
              <p className="text-slate-400 mb-4">Choose a merchant from the collections table above to configure their RAG settings.</p>
              <button
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
              >
                View Collections
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collection Details Modal */}
      {showDetails && selectedCollection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Collection Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Merchant</p>
                  <p className="text-white font-medium">{selectedCollection.merchant_name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Collection ID</p>
                  <p className="text-white font-mono text-sm">{selectedCollection.collection_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedCollection.document_count}</p>
                  <p className="text-slate-400 text-sm">Documents</p>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedCollection.search_performance.avg_query_time}ms</p>
                  <p className="text-slate-400 text-sm">Avg Query Time</p>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedCollection.search_performance.cache_hit_rate}%</p>
                  <p className="text-slate-400 text-sm">Cache Hit Rate</p>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-2">Embedding Model</p>
                <div className="bg-slate-900 rounded-lg p-3">
                  <p className="text-white font-medium">{selectedCollection.embedding_model}</p>
                  <p className="text-slate-400 text-sm">Last updated: {new Date(selectedCollection.last_updated).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedMerchant(selectedCollection.merchant_id);
                    setActiveTab('configuration');
                    setShowDetails(false);
                  }}
                  className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-white"
                >
                  Configure
                </button>
                <button
                  onClick={() => handleReindex(selectedCollection.merchant_id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white"
                >
                  Reindex
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
