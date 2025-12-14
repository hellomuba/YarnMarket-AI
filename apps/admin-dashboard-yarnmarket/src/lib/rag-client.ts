/**
 * RAG System Client for YarnMarket Dashboard
 * Handles communication with the RAG system for product search and catalog management
 */

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

interface SearchResult {
  products: ProductMatch[];
  total_found: number;
  max_similarity: number;
  processing_time: number;
}

interface ProductMatch extends ProductData {
  similarity_score: number;
  match_reason: string;
  merchant_id: string;
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

class RAGClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = 'http://localhost:8004') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`RAG API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Index merchant's product catalog
   */
  async indexMerchantCatalog(merchantId: string, products: ProductData[]): Promise<{
    indexed_products: number;
    failed_products: number;
    processing_time: number;
  }> {
    return this.makeRequest(`/merchants/${merchantId}/catalog/index`, {
      method: 'POST',
      body: JSON.stringify({ products }),
    });
  }

  /**
   * Search products using RAG
   */
  async searchProducts(
    merchantId: string,
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      filters?: {
        category?: string;
        brand?: string;
        in_stock?: boolean;
        price_range?: [number, number];
      };
    } = {}
  ): Promise<SearchResult> {
    const searchParams = new URLSearchParams({
      merchant_id: merchantId,
      query,
      limit: (options.limit || 10).toString(),
      threshold: (options.threshold || 0.3).toString(),
    });

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(`filter_${key}`, value.toString());
        }
      });
    }

    return this.makeRequest(`/search?${searchParams.toString()}`);
  }

  /**
   * Upload and analyze image for product matching
   */
  async searchByImage(
    merchantId: string,
    imageFile: File,
    options: { limit?: number } = {}
  ): Promise<SearchResult> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('merchant_id', merchantId);
    formData.append('limit', (options.limit || 5).toString());

    const response = await fetch(`${this.baseUrl}/search/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Image search failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get merchant's RAG statistics
   */
  async getMerchantStats(merchantId: string): Promise<RAGStats> {
    return this.makeRequest(`/merchants/${merchantId}/stats`);
  }

  /**
   * Delete merchant's catalog
   */
  async deleteMerchantCatalog(merchantId: string): Promise<{ success: boolean }> {
    return this.makeRequest(`/merchants/${merchantId}/catalog`, {
      method: 'DELETE',
    });
  }

  /**
   * Get RAG system health status
   */
  async getHealth(): Promise<{
    status: string;
    qdrant_status: string;
    models_loaded: string[];
    uptime: number;
  }> {
    return this.makeRequest('/health');
  }

  /**
   * Test RAG system with sample query
   */
  async testSearch(merchantId: string, testQuery: string = 'smartphone'): Promise<{
    query: string;
    results_count: number;
    processing_time: number;
    sample_results: ProductMatch[];
  }> {
    return this.makeRequest(`/test/search`, {
      method: 'POST',
      body: JSON.stringify({
        merchant_id: merchantId,
        query: testQuery,
        limit: 3,
      }),
    });
  }

  /**
   * Run offline demo (fallback when RAG system is not available)
   */
  async runOfflineDemo(sampleProducts: ProductData[]): Promise<SearchResult> {
    // This would use the local demo_rag_offline.py logic
    // For now, we'll simulate it
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          products: sampleProducts.slice(0, 3).map((product, index) => ({
            ...product,
            similarity_score: 0.8 - (index * 0.1),
            match_reason: `Demo match ${index + 1}`,
            merchant_id: 'demo_merchant',
          })),
          total_found: 3,
          max_similarity: 0.8,
          processing_time: 50,
        });
      }, 500);
    });
  }
}

export default RAGClient;
export type { ProductData, ProductMatch, SearchResult, RAGStats };
