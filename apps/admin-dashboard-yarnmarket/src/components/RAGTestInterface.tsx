'use client';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import RAGClient, { type ProductData, type SearchResult, type RAGStats } from '../lib/rag-client';

interface RAGTestInterfaceProps {
  merchantId?: string;
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
];

export default function RAGTestInterface({ merchantId = 'demo_electronics' }: RAGTestInterfaceProps) {
  const [ragClient] = useState(() => new RAGClient());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [ragStats, setRagStats] = useState<RAGStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ragStatus, setRagStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Check RAG system status on mount
  useEffect(() => {
    checkRAGStatus();
  }, []);

  const checkRAGStatus = async () => {
    try {
      await ragClient.getHealth();
      setRagStatus('online');
      loadRAGStats();
    } catch (error) {
      console.warn('RAG system offline, using demo mode:', error);
      setRagStatus('offline');
    }
  };

  const loadRAGStats = async () => {
    try {
      const stats = await ragClient.getMerchantStats(merchantId);
      setRagStats(stats);
    } catch (error) {
      console.warn('Could not load RAG stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      let results: SearchResult;

      if (ragStatus === 'online') {
        results = await ragClient.searchProducts(merchantId, searchQuery, {
          limit: 5,
          threshold: 0.3,
        });
      } else {
        // Use offline demo
        results = await ragClient.runOfflineDemo(SAMPLE_PRODUCTS);
      }

      setSearchResults(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSearch = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      let results: SearchResult;

      if (ragStatus === 'online') {
        results = await ragClient.searchByImage(merchantId, selectedImage, { limit: 5 });
      } else {
        // Simulate image search in offline mode
        results = await ragClient.runOfflineDemo(SAMPLE_PRODUCTS.filter(p => p.category === 'smartphones'));
      }

      setSearchResults(results);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Image search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndexCatalog = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (ragStatus === 'online') {
        const result = await ragClient.indexMerchantCatalog(merchantId, SAMPLE_PRODUCTS);
        alert(`Indexed ${result.indexed_products} products in ${result.processing_time.toFixed(2)}s`);
        await loadRAGStats();
      } else {
        alert('Demo mode: Would index sample products');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Indexing failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestRAG = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (ragStatus === 'online') {
        const result = await ragClient.testSearch(merchantId, 'smartphone');
        setSearchQuery('smartphone');
        setSearchResults({
          products: result.sample_results,
          total_found: result.results_count,
          max_similarity: result.sample_results[0]?.similarity_score || 0,
          processing_time: result.processing_time,
        });
      } else {
        const results = await ragClient.runOfflineDemo(SAMPLE_PRODUCTS);
        setSearchResults(results);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Image dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setSelectedImage(acceptedFiles[0]);
    },
  });

  return (
    <div className="space-y-6">
      {/* RAG Status Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">RAG System Testing</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              ragStatus === 'online' ? 'bg-green-500' :
              ragStatus === 'offline' ? 'bg-orange-500' : 'bg-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              ragStatus === 'online' ? 'text-green-700' :
              ragStatus === 'offline' ? 'text-orange-700' : 'text-gray-500'
            }`}>
              {ragStatus === 'online' ? 'RAG System Online' :
               ragStatus === 'offline' ? 'Demo Mode (RAG Offline)' : 'Checking...'}
            </span>
          </div>
        </div>

        {ragStats && (
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-blue-600 text-sm font-medium">Indexed Products</div>
              <div className="text-2xl font-bold text-blue-900">{ragStats.indexed_products}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-green-600 text-sm font-medium">Collections</div>
              <div className="text-2xl font-bold text-green-900">{ragStats.collections.length}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-purple-600 text-sm font-medium">Avg Query Time</div>
              <div className="text-2xl font-bold text-purple-900">
                {ragStats.search_performance.avg_query_time.toFixed(0)}ms
              </div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-orange-600 text-sm font-medium">Total Queries</div>
              <div className="text-2xl font-bold text-orange-900">{ragStats.search_performance.total_queries}</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <button
            onClick={handleIndexCatalog}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            📦 Index Sample Catalog
          </button>
          <button
            onClick={handleTestRAG}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            🧪 Run Test Search
          </button>
          <button
            onClick={checkRAGStatus}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
          >
            🔄 Refresh Status
          </button>
        </div>
      </div>

      {/* Text Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Search</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products... (e.g., 'iPhone smartphone', 'Samsung Galaxy', 'laptop M2')"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            🔍 Search
          </button>
        </div>
      </div>

      {/* Image Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Search</h3>
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            {selectedImage ? (
              <div>
                <p className="text-sm text-gray-600">Selected: {selectedImage.name}</p>
                <p className="text-xs text-gray-500 mt-1">Click to change or drag a new image</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">Drag & drop an image here, or click to select</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
          {selectedImage && (
            <button
              onClick={handleImageSearch}
              disabled={isLoading}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              🖼️ Search by Image
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Search Results ({searchResults.total_found} found in {searchResults.processing_time.toFixed(1)}ms)
          </h3>
          
          {searchResults.products.length > 0 ? (
            <div className="space-y-4">
              {searchResults.products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{product.name}</h4>
                      <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {product.category}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {product.brand}
                        </span>
                        <span className="font-medium text-green-600">
                          {product.currency} {product.price.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
