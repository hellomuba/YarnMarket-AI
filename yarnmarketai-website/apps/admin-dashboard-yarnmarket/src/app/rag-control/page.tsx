'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Brain, Database, Zap, Settings, BarChart3, Upload, Search, Image, Play, RefreshCw, Loader2, CheckCircle2, AlertCircle, Trash2, Download, Eye, Filter, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import RAGClient, { type ProductData, type SearchResult, type RAGStats } from '../../lib/rag-client';

// Advanced embedding control interfaces
interface EmbeddingModel {
  name: string;
  type: 'text' | 'image' | 'multimodal';
  dimensions: number;
  status: 'loaded' | 'loading' | 'error';
  memory_usage: number;
  performance: {
    avg_embedding_time: number;
    throughput: number;
  };
}

interface VectorCollection {
  name: string;
  merchant_id: string;
  product_count: number;
  created_at: string;
  last_updated: string;
  index_status: 'ready' | 'indexing' | 'error';
  dimensions: number;
  memory_usage: number;
}

interface EmbeddingSettings {
  text_model: string;
  image_model: string;
  similarity_threshold: number;
  max_results: number;
  auto_reindex: boolean;
  cache_embeddings: boolean;
  batch_size: number;
}

const SAMPLE_PRODUCTS: ProductData[] = [
  {
    id: 'iphone_14_pro',
    name: 'iPhone 14 Pro 128GB',
    description: 'Latest Apple iPhone with A16 Bionic chip, 48MP camera, Dynamic Island',
    category: 'smartphones',
    brand: 'Apple',
    price: 450000,
    currency: 'NGN',
    in_stock: true,
    quantity: 5,
    tags: ['apple', 'iphone', 'smartphone', 'premium'],
    images: ['iphone14pro.jpg']
  },
  {
    id: 'samsung_s23',
    name: 'Samsung Galaxy S23 256GB', 
    description: 'Flagship Samsung phone with Snapdragon 8 Gen 2, amazing camera',
    category: 'smartphones',
    brand: 'Samsung',
    price: 380000,
    currency: 'NGN',
    in_stock: true,
    quantity: 8,
    tags: ['samsung', 'galaxy', 'android', 'flagship'],
    images: ['galaxy_s23.jpg']
  },
  {
    id: 'macbook_air_m2',
    name: 'MacBook Air M2 13-inch',
    description: 'Apple MacBook Air with M2 chip, 8GB RAM, 256GB SSD, incredible performance',
    category: 'laptops',
    brand: 'Apple',
    price: 650000,
    currency: 'NGN',
    in_stock: true,
    quantity: 3,
    tags: ['apple', 'macbook', 'laptop', 'm2'],
    images: ['macbook_air_m2.jpg']
  },
  {
    id: 'airpods_pro_2',
    name: 'AirPods Pro (2nd generation)',
    description: 'Apple AirPods Pro with active noise cancellation and spatial audio',
    category: 'audio',
    brand: 'Apple',
    price: 120000,
    currency: 'NGN',
    in_stock: true,
    quantity: 10,
    tags: ['apple', 'airpods', 'wireless', 'noise-cancelling'],
    images: ['airpods_pro_2.jpg']
  },
];

export default function RAGControlCenter() {
  const [ragClient] = useState(() => new RAGClient());
  const [selectedMerchant, setSelectedMerchant] = useState('demo_electronics_store');
  const [ragStatus, setRagStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'embeddings' | 'collections'>('overview');
  
  const queryClient = useQueryClient();

  // Mock data for advanced features
  const [embeddingModels] = useState<EmbeddingModel[]>([
    {
      name: 'all-mpnet-base-v2',
      type: 'text',
      dimensions: 768,
      status: 'loaded',
      memory_usage: 1.2,
      performance: { avg_embedding_time: 25, throughput: 150 }
    },
    {
      name: 'clip-ViT-B-32',
      type: 'image',
      dimensions: 512,
      status: 'loaded',
      memory_usage: 2.1,
      performance: { avg_embedding_time: 45, throughput: 80 }
    }
  ]);

  const [vectorCollections] = useState<VectorCollection[]>([
    {
      name: 'demo_electronics_store_products',
      merchant_id: 'demo_electronics_store',
      product_count: SAMPLE_PRODUCTS.length,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      index_status: 'ready',
      dimensions: 768,
      memory_usage: 45.2
    }
  ]);

  const [embeddingSettings, setEmbeddingSettings] = useState<EmbeddingSettings>({
    text_model: 'all-mpnet-base-v2',
    image_model: 'clip-ViT-B-32',
    similarity_threshold: 0.3,
    max_results: 10,
    auto_reindex: true,
    cache_embeddings: true,
    batch_size: 32
  });

  // Check RAG system health
  const { data: healthStatus } = useQuery({
    queryKey: ['rag-health'],
    queryFn: () => ragClient.getHealth(),
    refetchInterval: 30000,
    onSuccess: () => setRagStatus('online'),
    onError: () => setRagStatus('offline'),
  });

  // Get RAG statistics
  const { data: ragStats } = useQuery({
    queryKey: ['rag-stats', selectedMerchant],
    queryFn: () => ragClient.getMerchantStats(selectedMerchant),
    enabled: ragStatus === 'online',
    refetchInterval: 60000,
  });

  // Index catalog mutation
  const indexCatalogMutation = useMutation({
    mutationFn: (products: ProductData[]) => ragClient.indexMerchantCatalog(selectedMerchant, products),
    onSuccess: (data) => {
      toast.success(`Successfully indexed ${data.indexed_products} products`);
      queryClient.invalidateQueries({ queryKey: ['rag-stats', selectedMerchant] });
    },
    onError: (error: Error) => {
      toast.error(`Indexing failed: ${error.message}`);
    },
  });

  // Search function
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      let results: SearchResult;

      if (ragStatus === 'online') {
        results = await ragClient.searchProducts(selectedMerchant, searchQuery, { 
          limit: embeddingSettings.max_results,
          threshold: embeddingSettings.similarity_threshold 
        });
      } else {
        results = await ragClient.runOfflineDemo(SAMPLE_PRODUCTS);
      }

      setSearchResults(results);
    } catch (error) {
      toast.error(`Search failed: ${(error as Error).message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Image search function
  const handleImageSearch = async () => {
    if (!selectedImage) return;

    setIsSearching(true);
    try {
      let results: SearchResult;

      if (ragStatus === 'online') {
        results = await ragClient.searchByImage(selectedMerchant, selectedImage, { 
          limit: embeddingSettings.max_results 
        });
      } else {
        results = await ragClient.runOfflineDemo(SAMPLE_PRODUCTS.filter(p => p.category === 'smartphones'));
      }

      setSearchResults(results);
    } catch (error) {
      toast.error(`Image search failed: ${(error as Error).message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const StatusIndicator = () => {
    const status = ragStatus === 'online' ? 'RAG System Online' : ragStatus === 'offline' ? 'Demo Mode (Offline)' : 'Checking Status...';
    const color = ragStatus === 'online' ? 'green' : ragStatus === 'offline' ? 'amber' : 'gray';
    
    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${
        color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
        color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        'bg-gray-50 text-gray-700 border-gray-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          color === 'green' ? 'bg-green-500' :
          color === 'amber' ? 'bg-amber-500' :
          'bg-gray-500'
        }`} />
        <span>{status}</span>
      </div>
    );
  };

  const TabButton = ({ tab, label, icon: Icon }: { tab: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-600 text-white'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Brain className="w-8 h-8 text-blue-600" />
                <span>RAG & Embedding Control Center</span>
              </h1>
              <p className="mt-2 text-gray-600">
                Advanced control and monitoring for the RAG system, vector embeddings, and intelligent search
              </p>
            </div>
            <StatusIndicator />
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <TabButton tab="overview" label="Overview" icon={BarChart3} />
            <TabButton tab="search" label="Search & Test" icon={Search} />
            <TabButton tab="embeddings" label="Embedding Models" icon={Brain} />
            <TabButton tab="collections" label="Vector Collections" icon={Database} />
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <Database className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Indexed Products</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {ragStats?.indexed_products || SAMPLE_PRODUCTS.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <Zap className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">Avg Query Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {ragStats?.search_performance?.avg_query_time?.toFixed(0) || '28'}ms
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Queries</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {ragStats?.search_performance?.total_queries || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <Settings className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Collections</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {ragStats?.collections?.length || vectorCollections.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => indexCatalogMutation.mutate(SAMPLE_PRODUCTS)}
                  disabled={indexCatalogMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {indexCatalogMutation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Index Sample Catalog</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('search');
                    setSearchQuery('smartphone');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Run Test Search</span>
                </button>

                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['rag-health'] })}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Services</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Qdrant Vector DB</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Connected</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Text Embeddings</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Loaded</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Image Embeddings</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Loaded</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Performance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Memory Usage</span>
                      <span className="text-gray-900 font-medium">3.4GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">CPU Usage</span>
                      <span className="text-gray-900 font-medium">12%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Cache Hit Rate</span>
                      <span className="text-gray-900 font-medium">84%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Text Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Text Search</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search products... (e.g., 'iPhone smartphone', 'Samsung Galaxy')"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="text-sm text-gray-500">
                    Try: "smartphone", "Apple products", "laptop M2", "wireless headphones"
                  </div>
                </div>
              </div>

              {/* Image Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Image className="w-5 h-5" />
                  <span>Image Search</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {selectedImage ? (
                        <div>
                          <Image className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-gray-900">{selectedImage.name}</p>
                          <p className="text-gray-500 text-sm mt-1">Click to change image</p>
                        </div>
                      ) : (
                        <div>
                          <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Click to upload an image</p>
                          <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {selectedImage && (
                    <button
                      onClick={handleImageSearch}
                      disabled={isSearching}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSearching ? (
                        <span className="flex items-center justify-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Searching...</span>
                        </span>
                      ) : (
                        'Search by Image'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search Results */}
            {searchResults && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Search Results ({searchResults.total_found} found in {searchResults.processing_time.toFixed(1)}ms)
                </h3>

                {searchResults.products.length > 0 ? (
                  <div className="space-y-4">
                    {searchResults.products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                            
                            <div className="flex items-center space-x-4 mt-3 text-sm">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {product.category}
                              </span>
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                {product.brand}
                              </span>
                              <span className="font-medium text-green-600">
                                {product.currency} {product.price.toLocaleString()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                product.in_stock 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.in_stock ? '✅ In Stock' : '❌ Out of Stock'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="ml-4 text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {(product.similarity_score * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">similarity</div>
                            <div className="text-xs text-gray-600 mt-1 max-w-32">
                              {product.match_reason}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No products found matching your search criteria
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'embeddings' && (
          <div className="space-y-6">
            {/* Embedding Models */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loaded Embedding Models</h3>
              <div className="space-y-4">
                {embeddingModels.map((model) => (
                  <div key={model.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">{model.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            model.type === 'text' ? 'bg-blue-100 text-blue-800' :
                            model.type === 'image' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {model.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            model.status === 'loaded' ? 'bg-green-100 text-green-800' :
                            model.status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {model.status}
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Dimensions:</span>
                            <span className="ml-1 font-medium">{model.dimensions}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Memory:</span>
                            <span className="ml-1 font-medium">{model.memory_usage.toFixed(1)}GB</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Avg Time:</span>
                            <span className="ml-1 font-medium">{model.performance.avg_embedding_time}ms</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Throughput:</span>
                            <span className="ml-1 font-medium">{model.performance.throughput}/sec</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedding Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Embedding Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Text Model</label>
                  <select
                    value={embeddingSettings.text_model}
                    onChange={(e) => setEmbeddingSettings({...embeddingSettings, text_model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all-mpnet-base-v2">all-mpnet-base-v2 (768 dims)</option>
                    <option value="all-MiniLM-L6-v2">all-MiniLM-L6-v2 (384 dims)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Model</label>
                  <select
                    value={embeddingSettings.image_model}
                    onChange={(e) => setEmbeddingSettings({...embeddingSettings, image_model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="clip-ViT-B-32">clip-ViT-B-32 (512 dims)</option>
                    <option value="clip-ViT-L-14">clip-ViT-L-14 (768 dims)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Similarity Threshold: {embeddingSettings.similarity_threshold}
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    value={embeddingSettings.similarity_threshold}
                    onChange={(e) => setEmbeddingSettings({...embeddingSettings, similarity_threshold: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.1 (Loose)</span>
                    <span>0.9 (Strict)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Results</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={embeddingSettings.max_results}
                    onChange={(e) => setEmbeddingSettings({...embeddingSettings, max_results: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Size</label>
                  <input
                    type="number"
                    min="1"
                    max="128"
                    value={embeddingSettings.batch_size}
                    onChange={(e) => setEmbeddingSettings({...embeddingSettings, batch_size: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="auto-reindex"
                      checked={embeddingSettings.auto_reindex}
                      onChange={(e) => setEmbeddingSettings({...embeddingSettings, auto_reindex: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="auto-reindex" className="ml-2 text-sm text-gray-700">
                      Auto-reindex on product updates
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="cache-embeddings"
                      checked={embeddingSettings.cache_embeddings}
                      onChange={(e) => setEmbeddingSettings({...embeddingSettings, cache_embeddings: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="cache-embeddings" className="ml-2 text-sm text-gray-700">
                      Cache embeddings for faster search
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="space-y-6">
            {/* Vector Collections */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Vector Collections</h3>
                <button className="flex items-center space-x-2 px-3 py-1 text-blue-600 hover:text-blue-700">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="space-y-4">
                {vectorCollections.map((collection) => (
                  <div key={collection.name} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-900">{collection.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            collection.index_status === 'ready' ? 'bg-green-100 text-green-800' :
                            collection.index_status === 'indexing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {collection.index_status}
                          </span>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Products:</span>
                            <span className="ml-1 font-medium">{collection.product_count}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Dimensions:</span>
                            <span className="ml-1 font-medium">{collection.dimensions}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Memory:</span>
                            <span className="ml-1 font-medium">{collection.memory_usage}MB</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <span className="ml-1 font-medium">
                              {new Date(collection.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Updated:</span>
                            <span className="ml-1 font-medium">
                              {new Date(collection.last_updated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-blue-600 hover:text-blue-700">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:text-green-700">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collection Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {vectorCollections.reduce((sum, col) => sum + col.product_count, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Vectors</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {vectorCollections.reduce((sum, col) => sum + col.memory_usage, 0).toFixed(1)}MB
                  </div>
                  <div className="text-sm text-gray-500">Memory Usage</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {vectorCollections.filter(col => col.index_status === 'ready').length}
                  </div>
                  <div className="text-sm text-gray-500">Ready Collections</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
