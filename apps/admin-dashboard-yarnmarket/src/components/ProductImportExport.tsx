'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  X,
  Eye,
  Calendar,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

interface ImportJob {
  id: string;
  merchant_id: string;
  job_type: 'csv_import' | 'json_import' | 'api_sync';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_name?: string;
  total_products: number;
  processed_products: number;
  failed_products: number;
  error_details?: any;
  created_at: string;
  completed_at?: string;
}

interface ProductImportExportProps {
  merchantId: string;
  onImportComplete?: (jobId: string) => void;
}

const mockImportJobs: ImportJob[] = [
  {
    id: 'job_001',
    merchant_id: 'tech_solutions',
    job_type: 'csv_import',
    status: 'completed',
    file_name: 'electronics_catalog_jan2024.csv',
    total_products: 245,
    processed_products: 243,
    failed_products: 2,
    created_at: '2024-01-15T10:30:00Z',
    completed_at: '2024-01-15T10:35:00Z'
  },
  {
    id: 'job_002', 
    merchant_id: 'tech_solutions',
    job_type: 'json_import',
    status: 'processing',
    file_name: 'new_arrivals.json',
    total_products: 50,
    processed_products: 32,
    failed_products: 0,
    created_at: '2024-01-15T14:20:00Z'
  }
];

export default function ProductImportExport({ merchantId, onImportComplete }: ProductImportExportProps) {
  const [importJobs, setImportJobs] = useState<ImportJob[]>(mockImportJobs);
  const [uploading, setUploading] = useState(false);
  const [showImportHistory, setShowImportHistory] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ImportJob | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV or JSON file');
      return;
    }

    setUploading(true);
    
    try {
      // Simulate file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('merchant_id', merchantId);

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newJob: ImportJob = {
        id: `job_${Date.now()}`,
        merchant_id: merchantId,
        job_type: file.name.endsWith('.json') ? 'json_import' : 'csv_import',
        status: 'processing',
        file_name: file.name,
        total_products: Math.floor(Math.random() * 500) + 50,
        processed_products: 0,
        failed_products: 0,
        created_at: new Date().toISOString()
      };

      setImportJobs(prev => [newJob, ...prev]);
      toast.success(`Import started for ${file.name}`);
      onImportComplete?.(newJob.id);

      // Simulate processing completion
      setTimeout(() => {
        setImportJobs(prev => 
          prev.map(job => 
            job.id === newJob.id 
              ? {
                  ...job,
                  status: 'completed',
                  processed_products: job.total_products - 2,
                  failed_products: 2,
                  completed_at: new Date().toISOString()
                }
              : job
          )
        );
      }, 5000);

    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [merchantId, onImportComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.ms-excel': ['.xlsx', '.xls']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    try {
      toast.info(`Preparing ${format.toUpperCase()} export...`);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate file download
      const blob = new Blob([`Mock ${format} export data`], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products_${merchantId}_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Products exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Export failed. Please try again.');
    }
  };

  const getStatusColor = (status: ImportJob['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'processing': return 'text-yellow-400 bg-yellow-400/10';
      case 'failed': return 'text-red-400 bg-red-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getStatusIcon = (status: ImportJob['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <RefreshCw className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Section */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Import Products</h3>
          <button
            onClick={() => setShowImportHistory(!showImportHistory)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-green-500 bg-green-500/10' 
              : 'border-slate-600 hover:border-slate-500'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-400">Uploading and processing...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-white font-medium">
                {isDragActive ? 'Drop files here' : 'Drag & drop product files here'}
              </p>
              <p className="text-slate-400 text-sm">
                Supports CSV, JSON, Excel files • Max 10MB
              </p>
            </div>
          )}
        </div>

        {/* Sample Format */}
        <div className="mt-4 p-4 bg-slate-900 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">Required CSV Format:</h4>
          <code className="text-xs text-slate-300 block">
            product_id,name,description,price,currency,category,brand,in_stock,quantity,tags
          </code>
          <p className="text-xs text-slate-500 mt-1">
            Download sample template or view import documentation
          </p>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Export Products</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center justify-center space-x-2 p-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <FileText className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">CSV</span>
          </button>
          
          <button
            onClick={() => handleExport('json')}
            className="flex items-center justify-center space-x-2 p-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <FileText className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">JSON</span>
          </button>
          
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center justify-center space-x-2 p-4 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <FileText className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">Excel</span>
          </button>
        </div>
      </div>

      {/* Import History */}
      {showImportHistory && (
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Import History</h3>
            <button
              onClick={() => setShowImportHistory(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            {importJobs.map((job) => (
              <div key={job.id} className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor(job.status)}`}>
                      {getStatusIcon(job.status)}
                      <span className="capitalize">{job.status}</span>
                    </div>
                    
                    <div>
                      <p className="text-white font-medium text-sm">{job.file_name}</p>
                      <p className="text-slate-400 text-xs">
                        {new Date(job.created_at).toLocaleDateString()} • {job.job_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 flex items-center space-x-4 text-xs text-slate-400">
                  <span>Total: {job.total_products}</span>
                  <span>Processed: {job.processed_products}</span>
                  {job.failed_products > 0 && (
                    <span className="text-red-400">Failed: {job.failed_products}</span>
                  )}
                </div>

                {job.status === 'processing' && (
                  <div className="mt-2">
                    <div className="bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(job.processed_products / job.total_products) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Import Job Details</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">File Name</p>
                  <p className="text-white font-medium">{selectedJob.file_name}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs ${getStatusColor(selectedJob.status)}`}>
                    {getStatusIcon(selectedJob.status)}
                    <span className="capitalize">{selectedJob.status}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <Package className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedJob.total_products}</p>
                  <p className="text-slate-400 text-sm">Total Products</p>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedJob.processed_products}</p>
                  <p className="text-slate-400 text-sm">Processed</p>
                </div>
                <div className="text-center p-4 bg-slate-900 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{selectedJob.failed_products}</p>
                  <p className="text-slate-400 text-sm">Failed</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">Started</p>
                  <p className="text-white">{new Date(selectedJob.created_at).toLocaleString()}</p>
                </div>
                {selectedJob.completed_at && (
                  <div>
                    <p className="text-slate-400 text-sm">Completed</p>
                    <p className="text-white">{new Date(selectedJob.completed_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {selectedJob.error_details && (
                <div>
                  <p className="text-slate-400 text-sm mb-2">Error Details</p>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <pre className="text-red-400 text-xs overflow-x-auto">
                      {JSON.stringify(selectedJob.error_details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
