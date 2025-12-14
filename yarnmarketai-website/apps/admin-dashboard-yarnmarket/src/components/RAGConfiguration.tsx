'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Zap, 
  Clock, 
  Target,
  Info,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface RAGConfig {
  merchant_id: string;
  embedding_model: string;
  similarity_threshold: number;
  max_results: number;
  cache_ttl: number;
  auto_reindex: boolean;
  reindex_schedule: string;
  search_boost: {
    price_match: number;
    category_match: number;
    brand_match: number;
    availability_boost: number;
  };
  performance: {
    enable_caching: boolean;
    batch_size: number;
    timeout_ms: number;
  };
}

interface RAGConfigurationProps {
  merchantId: string;
  initialConfig?: Partial<RAGConfig>;
  onConfigChange?: (config: RAGConfig) => void;
}

const EMBEDDING_MODELS = [
  {
    id: 'all-MiniLM-L6-v2',
    name: 'All-MiniLM-L6-v2',
    description: 'Fast, general-purpose model (384D)',
    dimensions: 384,
    performance: 'Fast',
    quality: 'Good'
  },
  {
    id: 'all-mpnet-base-v2',
    name: 'All-MPNet-Base-v2',
    description: 'High-quality, balanced model (768D)',
    dimensions: 768,
    performance: 'Medium',
    quality: 'Excellent'
  },
  {
    id: 'paraphrase-multilingual-MiniLM-L12-v2',
    name: 'Multilingual MiniLM-L12-v2',
    description: 'Supports multiple languages including Nigerian Pidgin',
    dimensions: 384,
    performance: 'Medium',
    quality: 'Very Good'
  },
  {
    id: 'yarnmarket-custom-v1',
    name: 'YarnMarket Custom v1',
    description: 'Fine-tuned for Nigerian commerce and Pidgin',
    dimensions: 512,
    performance: 'Medium',
    quality: 'Excellent'
  }
];

const defaultConfig: RAGConfig = {
  merchant_id: '',
  embedding_model: 'all-MiniLM-L6-v2',
  similarity_threshold: 0.7,
  max_results: 10,
  cache_ttl: 3600,
  auto_reindex: true,
  reindex_schedule: 'daily',
  search_boost: {
    price_match: 1.2,
    category_match: 1.1,
    brand_match: 1.05,
    availability_boost: 1.3
  },
  performance: {
    enable_caching: true,
    batch_size: 100,
    timeout_ms: 5000
  }
};

export default function RAGConfiguration({ 
  merchantId, 
  initialConfig = {}, 
  onConfigChange 
}: RAGConfigurationProps) {
  const [config, setConfig] = useState<RAGConfig>({
    ...defaultConfig,
    merchant_id: merchantId,
    ...initialConfig
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleConfigChange = (path: string, value: any) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock API call to save configuration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('RAG configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConfiguration = async () => {
    setTesting(true);
    try {
      // Mock test queries
      const testQueries = [
        'iPhone 14 Pro Max price',
        'Samsung Galaxy S23 available colors',
        'Laptop under 300k naira'
      ];

      await new Promise(resolve => setTimeout(resolve, 2000));

      setTestResults({
        queries_tested: 3,
        avg_response_time: 127,
        avg_similarity_score: 0.85,
        results_found: 28,
        cache_hits: 2,
        errors: 0
      });

      toast.success('Configuration test completed');
    } catch (error) {
      toast.error('Configuration test failed');
    } finally {
      setTesting(false);
    }
  };

  const selectedModel = EMBEDDING_MODELS.find(m => m.id === config.embedding_model);

  return (
    <div className="space-y-6">
      {/* Embedding Model Selection */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Embedding Model</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {EMBEDDING_MODELS.map((model) => (
            <div
              key={model.id}
              onClick={() => handleConfigChange('embedding_model', model.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                config.embedding_model === model.id
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{model.name}</h4>
                  <p className="text-sm text-slate-400 mt-1">{model.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-3 text-xs">
                    <span className="text-slate-500">{model.dimensions}D</span>
                    <span className={`px-2 py-1 rounded ${
                      model.performance === 'Fast' ? 'bg-green-500/20 text-green-400' :
                      model.performance === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {model.performance}
                    </span>
                    <span className="text-slate-500">Quality: {model.quality}</span>
                  </div>
                </div>
                
                {config.embedding_model === model.id && (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedModel && (
          <div className="mt-4 p-4 bg-slate-900 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Model Details</span>
            </div>
            <p className="text-sm text-slate-400">
              Currently using <strong>{selectedModel.name}</strong> with {selectedModel.dimensions} dimensions.
              This model is optimized for {selectedModel.performance.toLowerCase()} performance 
              with {selectedModel.quality.toLowerCase()} quality results.
            </p>
          </div>
        )}
      </div>

      {/* Search Configuration */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Search Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Similarity Threshold
              </label>
              <input
                type="range"
                min="0.5"
                max="0.95"
                step="0.05"
                value={config.similarity_threshold}
                onChange={(e) => handleConfigChange('similarity_threshold', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0.5 (More results)</span>
                <span className="text-white font-medium">{config.similarity_threshold}</span>
                <span>0.95 (Exact matches)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Max Results
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={config.max_results}
                onChange={(e) => handleConfigChange('max_results', parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Cache TTL (seconds)
              </label>
              <input
                type="number"
                min="300"
                max="86400"
                value={config.cache_ttl}
                onChange={(e) => handleConfigChange('cache_ttl', parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.auto_reindex}
                  onChange={(e) => handleConfigChange('auto_reindex', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-white">Enable auto re-indexing</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Search Boost Settings */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Search Boost Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(config.search_boost).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-white mb-2">
                {key.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </label>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.05"
                value={value}
                onChange={(e) => 
                  handleConfigChange(`search_boost.${key}`, parseFloat(e.target.value))
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>1.0x</span>
                <span className="text-white font-medium">{value}x</span>
                <span>2.0x</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Performance Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={config.performance.enable_caching}
                onChange={(e) => 
                  handleConfigChange('performance.enable_caching', e.target.checked)
                }
                className="rounded"
              />
              <span className="text-sm text-white">Enable result caching</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Batch Size
            </label>
            <input
              type="number"
              min="50"
              max="500"
              value={config.performance.batch_size}
              onChange={(e) => 
                handleConfigChange('performance.batch_size', parseInt(e.target.value))
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Timeout (ms)
            </label>
            <input
              type="number"
              min="1000"
              max="30000"
              value={config.performance.timeout_ms}
              onChange={(e) => 
                handleConfigChange('performance.timeout_ms', parseInt(e.target.value))
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Test Results</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-900 rounded-lg">
              <p className="text-2xl font-bold text-white">{testResults.queries_tested}</p>
              <p className="text-slate-400 text-sm">Queries Tested</p>
            </div>
            <div className="text-center p-4 bg-slate-900 rounded-lg">
              <p className="text-2xl font-bold text-white">{testResults.avg_response_time}ms</p>
              <p className="text-slate-400 text-sm">Avg Response Time</p>
            </div>
            <div className="text-center p-4 bg-slate-900 rounded-lg">
              <p className="text-2xl font-bold text-white">{testResults.avg_similarity_score}</p>
              <p className="text-slate-400 text-sm">Avg Similarity</p>
            </div>
            <div className="text-center p-4 bg-slate-900 rounded-lg">
              <p className="text-2xl font-bold text-white">{testResults.results_found}</p>
              <p className="text-slate-400 text-sm">Results Found</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={handleTestConfiguration}
          disabled={testing}
          className="flex items-center space-x-2 px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {testing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Target className="w-4 h-4" />
          )}
          <span className="text-white">
            {testing ? 'Testing...' : 'Test Configuration'}
          </span>
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span className="text-white">
            {saving ? 'Saving...' : 'Save Configuration'}
          </span>
        </button>
      </div>
    </div>
  );
}
