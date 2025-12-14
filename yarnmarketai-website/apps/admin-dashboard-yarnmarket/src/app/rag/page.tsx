import RAGTestInterface from '../../components/RAGTestInterface';

export default function RAGPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">RAG System Testing & Management</h1>
          <p className="mt-2 text-gray-600">
            Test and manage the RAG (Retrieval-Augmented Generation) system for product search and recommendations.
          </p>
        </div>
        
        <RAGTestInterface merchantId="demo_electronics_store" />
      </div>
    </div>
  );
}
