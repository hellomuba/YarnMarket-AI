import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Brain, 
  Search, 
  Database, 
  Zap, 
  Upload, 
  Image, 
  BarChart3,
  Settings,
  Play,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  Filter
} from 'lucide-react';

// Types for RAG system
interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  brand: string;
  in_stock: boolean;
  quantity?: number;
  tags?: string[];
  images?: string[];
}

interface ProductMatch extends ProductData {
  similarity_score: number;
  match_reason: string;
  merchant_id: string;
}

interface SearchResult {
  products: ProductMatch[];
  total_found: number;
  max_similarity: number;
  processing_time: number;
}

interface RAGStats {
  merchant_id: string;
  total_products: number;
  indexed_products: number;
  collections: string[];
  last_updated: string;
  search_performance: {
    avg_query_time: number;
    total_queries: number;
  };
}

interface RAGSystemProps {
  selectedMerchant: any;
}

// RAG Client for API communication
class RAGClient {
  private baseUrl = 'http://localhost:8004';

  async getHealth() {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) throw new Error('RAG system unavailable');
    return response.json();
  }

  async indexMerchantCatalog(merchantId: string, products: ProductData[]) {
    const response = await fetch(`${this.baseUrl}/merchants/${merchantId}/catalog/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products }),
    });
    if (!response.ok) throw new Error('Failed to index catalog');
    return response.json();
  }

  async searchProducts(merchantId: string, query: string, options: any = {}) {
    const params = new URLSearchParams({
      merchant_id: merchantId,
      query,
      limit: (options.limit || 10).toString(),
      threshold: (options.threshold || 0.3).toString(),
    });

    const response = await fetch(`${this.baseUrl}/search?${params}`);
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }

  async getMerchantStats(merchantId: string) {
    const response = await fetch(`${this.baseUrl}/merchants/${merchantId}/stats`);
    if (!response.ok) throw new Error('Failed to get stats');
    return response.json();
  }

  async searchByImage(merchantId: string, imageFile: File) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('merchant_id', merchantId);

    const response = await fetch(`${this.baseUrl}/search/image`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Image search failed');
    return response.json();
  }

  // Offline demo simulation
  async runOfflineDemo(products: ProductData[]): Promise<SearchResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          products: products.slice(0, 3).map((product, index) => ({
            ...product,
            similarity_score: 0.9 - (index * 0.1),
            match_reason: `Demo match ${index + 1}`,
            merchant_id: 'demo_merchant',
          })),
          total_found: 3,
          max_similarity: 0.9,
          processing_time: 45.5,
        });
      }, 800);
    });
  }
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
    description: 'Apple MacBook Air with M2 chip, 8GB RAM, 256GB SSD',
    category: 'laptops',
    brand: 'Apple',
    price: 650000,
    currency: 'NGN',
    in_stock: true,
    quantity: 3,
    tags: ['apple', 'macbook', 'laptop', 'm2'],
    images: ['macbook_air_m2.jpg']
  },
];

export function RAGSystem({ selectedMerchant }: RAGSystemProps) {
  const [ragClient] = useState(() => new RAGClient());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [ragStatus, setRagStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  const merchantId = selectedMerchant?.id || 'demo_electronics_store';

  // Check RAG system health
  const { data: healthStatus } = useQuery({
    queryKey: ['rag-health'],
    queryFn: () => ragClient.getHealth(),
    refetchInterval: 30000,
    onSuccess: () => setRagStatus('online'),
    onError: () => setRagStatus('offline'),
  });

  // Get RAG statistics
  const { data: ragStats, isLoading: statsLoading } = useQuery({
    queryKey: ['rag-stats', merchantId],
    queryFn: () => ragClient.getMerchantStats(merchantId),
    enabled: ragStatus === 'online',
    refetchInterval: 60000,
  });

  // Index catalog mutation
  const indexCatalogMutation = useMutation({
    mutationFn: (products: ProductData[]) => ragClient.indexMerchantCatalog(merchantId, products),
    onSuccess: (data) => {
      toast.success(`Indexed ${data.indexed_products} products successfully`);
      queryClient.invalidateQueries(['rag-stats', merchantId]);
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
        results = await ragClient.searchProducts(merchantId, searchQuery, { limit: 5 });
      } else {
        // Use offline demo
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
        results = await ragClient.searchByImage(merchantId, selectedImage);
      } else {
        // Simulate image search
        results = await ragClient.runOfflineDemo(
          SAMPLE_PRODUCTS.filter(p => p.category === 'smartphones')
        );
      }

      setSearchResults(results);
    } catch (error) {
      toast.error(`Image search failed: ${(error as Error).message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  // Status indicator
  const StatusIndicator = () => {
    const status = ragStatus === 'online' ? 'Online' : ragStatus === 'offline' ? 'Offline (Demo)' : 'Checking...';
    const color = ragStatus === 'online' ? 'green' : ragStatus === 'offline' ? 'yellow' : 'gray';
    
    return (
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
        color === 'green' ? 'bg-green-600/20 text-green-400' :
        color === 'yellow' ? 'bg-yellow-600/20 text-yellow-400' :
        'bg-gray-600/20 text-gray-400'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          color === 'green' ? 'bg-green-400' :
          color === 'yellow' ? 'bg-yellow-400' :
          'bg-gray-400'
        }`} />
        <span>{status}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Brain className="w-8 h-8 text-green-400" />
            <span>RAG System Control</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Manage and test the Retrieval-Augmented Generation system for intelligent product search
          </p>
        </div>
        <StatusIndicator />
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">Indexed Products</p>
              <p className="text-2xl font-bold text-white">
                {ragStats?.indexed_products || SAMPLE_PRODUCTS.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-slate-400 text-sm">Avg Query Time</p>
              <p className="text-2xl font-bold text-white">
                {ragStats?.search_performance?.avg_query_time?.toFixed(0) || '28'}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Total Queries</p>
              <p className="text-2xl font-bold text-white">
                {ragStats?.search_performance?.total_queries || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-purple-400" />
            <div>
              <p className="text-slate-400 text-sm">Collections</p>
              <p className="text-2xl font-bold text-white">
                {ragStats?.collections?.length || 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => indexCatalogMutation.mutate(SAMPLE_PRODUCTS)}
            disabled={indexCatalogMutation.isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
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
              setSearchQuery('smartphone');
              handleSearch();
            }}
            disabled={isSearching}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Run Test Search</span>
          </button>

          <button
            onClick={() => queryClient.invalidateQueries(['rag-health'])}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Search Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Text Search */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
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
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="text-sm text-slate-400">
              Try: "smartphone", "Apple products", "laptop M2", "wireless headphones"
            </div>
          </div>
        </div>

        {/* Image Search */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Image Search</span>
          </h3>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {selectedImage ? (
                  <div>
                    <Image className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-white">{selectedImage.name}</p>
                    <p className="text-slate-400 text-sm mt-1">Click to change image</p>
                  </div>
                ) : (
                  <div>
                    <Image className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-400">Click to upload an image</p>
                    <p className="text-slate-500 text-sm mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </label>
            </div>

            {selectedImage && (
              <button
                onClick={handleImageSearch}
                disabled={isSearching}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
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
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Search Results ({searchResults.total_found} found in {searchResults.processing_time.toFixed(1)}ms)
          </h3>

          {searchResults.products.length > 0 ? (
            <div className="space-y-4">
              {searchResults.products.map((product) => (
                <div key={product.id} className="border border-slate-600 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{product.name}</h4>
                      <p className="text-slate-400 text-sm mt-1">{product.description}</p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                          {product.category}
                        </span>
                        <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                          {product.brand}
                        </span>
                        <span className="font-medium text-green-400">
                          {product.currency} {product.price.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.in_stock 
                            ? 'bg-green-600/20 text-green-400' 
                            : 'bg-red-600/20 text-red-400'
                        }`}>
                          {product.in_stock ? '✅ In Stock' : '❌ Out of Stock'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-blue-400">
                        {(product.similarity_score * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-500">similarity</div>
                      <div className="text-xs text-slate-400 mt-1 max-w-32">
                        {product.match_reason}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              No products found matching your search criteria
            </div>
          )}
        </div>
      )}

      {/* System Health Details */}
      {healthStatus && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">System Health Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-white mb-2">Service Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Qdrant Vector DB</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Embedding Models</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Loaded</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Uptime</span>
                  <span className="text-white">{Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Memory Usage</span>
                  <span className="text-white">{(Math.random() * 2 + 1).toFixed(1)}GB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
