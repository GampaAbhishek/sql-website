'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Upload, 
  File, 
  Database, 
  Check, 
  X, 
  Eye, 
  Play, 
  Trash2, 
  Download, 
  AlertCircle, 
  User, 
  Crown, 
  FileText,
  Table,
  Settings,
  RefreshCw,
  ChevronRight,
  Info,
  Zap,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';

interface UploadedTable {
  id: string;
  name: string;
  fileName: string;
  fileType: 'csv' | 'json' | 'sqlite';
  columns: {
    name: string;
    type: string;
    nullable: boolean;
  }[];
  rowCount: number;
  uploadDate: string;
  size: string;
  preview: Record<string, any>[];
}

interface UploadStatus {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export default function CustomDatabasePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false
  });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [customTableName, setCustomTableName] = useState('');

  // Mock premium status - in real app this would come from user context
  const isPremiumUser = true; // user?.subscription === 'premium'

  // Mock uploaded tables data
  const [uploadedTables, setUploadedTables] = useState<UploadedTable[]>([
    {
      id: '1',
      name: 'customer_data',
      fileName: 'customers.csv',
      fileType: 'csv',
      columns: [
        { name: 'customer_id', type: 'INTEGER', nullable: false },
        { name: 'first_name', type: 'VARCHAR(50)', nullable: false },
        { name: 'last_name', type: 'VARCHAR(50)', nullable: false },
        { name: 'email', type: 'VARCHAR(100)', nullable: true },
        { name: 'registration_date', type: 'DATE', nullable: false },
        { name: 'total_spent', type: 'DECIMAL(10,2)', nullable: true }
      ],
      rowCount: 1547,
      uploadDate: '2 hours ago',
      size: '124 KB',
      preview: [
        { customer_id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@email.com', registration_date: '2024-01-15', total_spent: 299.99 },
        { customer_id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@email.com', registration_date: '2024-02-20', total_spent: 189.50 },
        { customer_id: 3, first_name: 'Bob', last_name: 'Johnson', email: 'bob.j@email.com', registration_date: '2024-03-10', total_spent: 450.00 }
      ]
    },
    {
      id: '2',
      name: 'sales_transactions',
      fileName: 'sales.json',
      fileType: 'json',
      columns: [
        { name: 'transaction_id', type: 'INTEGER', nullable: false },
        { name: 'customer_id', type: 'INTEGER', nullable: false },
        { name: 'product_name', type: 'VARCHAR(100)', nullable: false },
        { name: 'quantity', type: 'INTEGER', nullable: false },
        { name: 'unit_price', type: 'DECIMAL(8,2)', nullable: false },
        { name: 'transaction_date', type: 'TIMESTAMP', nullable: false }
      ],
      rowCount: 3241,
      uploadDate: '1 day ago',
      size: '287 KB',
      preview: [
        { transaction_id: 1001, customer_id: 1, product_name: 'Laptop Pro', quantity: 1, unit_price: 1299.99, transaction_date: '2024-09-01 14:30:00' },
        { transaction_id: 1002, customer_id: 2, product_name: 'Wireless Mouse', quantity: 2, unit_price: 29.99, transaction_date: '2024-09-01 15:45:00' },
        { transaction_id: 1003, customer_id: 1, product_name: 'USB Cable', quantity: 3, unit_price: 12.99, transaction_date: '2024-09-02 09:15:00' }
      ]
    }
  ]);

  const supportedFormats = [
    { ext: 'CSV', desc: 'Comma-separated values', icon: FileText },
    { ext: 'JSON', desc: 'JavaScript Object Notation', icon: File },
    { ext: 'SQLite', desc: 'SQLite database file', icon: Database }
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    const validTypes = ['text/csv', 'application/json', 'application/x-sqlite3'];
    const validExtensions = ['.csv', '.json', '.sqlite', '.db'];

    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      setUploadStatus({
        isUploading: false,
        progress: 0,
        error: 'Invalid file format. Please upload CSV, JSON, or SQLite files.',
        success: false
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setUploadStatus({
        isUploading: false,
        progress: 0,
        error: 'File size too large. Maximum size is 50MB.',
        success: false
      });
      return;
    }

    // Simulate file upload with progress
    setUploadStatus({
      isUploading: true,
      progress: 0,
      error: null,
      success: false
    });

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadStatus(prev => ({ ...prev, progress }));
    }

    // Simulate successful upload
    setTimeout(() => {
      const newTable: UploadedTable = {
        id: Date.now().toString(),
        name: customTableName || file.name.split('.')[0],
        fileName: file.name,
        fileType: file.name.split('.').pop()?.toLowerCase() as 'csv' | 'json' | 'sqlite',
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false },
          { name: 'name', type: 'VARCHAR(100)', nullable: false },
          { name: 'value', type: 'DECIMAL(10,2)', nullable: true }
        ],
        rowCount: Math.floor(Math.random() * 5000) + 100,
        uploadDate: 'Just now',
        size: `${Math.round(file.size / 1024)} KB`,
        preview: [
          { id: 1, name: 'Sample Data 1', value: 123.45 },
          { id: 2, name: 'Sample Data 2', value: 678.90 },
          { id: 3, name: 'Sample Data 3', value: 234.56 }
        ]
      };

      setUploadedTables(prev => [newTable, ...prev]);
      setUploadStatus({
        isUploading: false,
        progress: 100,
        error: null,
        success: true
      });
      setCustomTableName('');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, success: false }));
      }, 3000);
    }, 1000);
  };

  const handleRemoveTable = (tableId: string) => {
    setUploadedTables(prev => prev.filter(table => table.id !== tableId));
    if (selectedTable === tableId) {
      setSelectedTable(null);
    }
    if (showPreview === tableId) {
      setShowPreview(null);
    }
  };

  const handleLoadToPlayground = (table: UploadedTable) => {
    // In real app, this would navigate to playground with the custom database loaded
    console.log('Loading table to playground:', table.name);
    // For now, just show a success message
    alert(`Table "${table.name}" loaded into Playground!`);
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'csv': return FileText;
      case 'json': return File;
      case 'sqlite': return Database;
      default: return File;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'csv': return 'text-green-400 bg-green-400/20';
      case 'json': return 'text-blue-400 bg-blue-400/20';
      case 'sqlite': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-slate-400 bg-slate-400/20';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Login</h1>
          <p className="text-slate-400 mb-6">You need to be logged in to access Custom Database</p>
          <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isPremiumUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        {/* Navigation Bar */}
        <ResponsiveNavbar />

        {/* Premium Upgrade Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Custom Database Upload</h1>
            <p className="text-xl text-slate-400 mb-8">Upload your own datasets and practice SQL queries on real data</p>
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 inline-block">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-2">Premium Feature</h2>
              <p className="text-slate-300">Upgrade to Premium to unlock custom database uploads</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <Upload className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Multiple Formats</h3>
              </div>
              <p className="text-slate-400 mb-4">Upload CSV, JSON, or SQLite files with automatic schema detection</p>
              <div className="space-y-2">
                {supportedFormats.map((format) => (
                  <div key={format.ext} className="flex items-center space-x-2 text-sm text-slate-300">
                    <format.icon className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{format.ext}</span>
                    <span className="text-slate-500">- {format.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Secure & Private</h3>
              </div>
              <p className="text-slate-400 mb-4">Your data is encrypted and only accessible to you</p>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>End-to-end encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Private database instances</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Automatic data cleanup</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">Real-time Queries</h3>
              </div>
              <p className="text-slate-400 mb-4">Run SQL queries instantly on your uploaded datasets</p>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Instant query execution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Advanced SQL features</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Performance analytics</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <Table className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Multi-table Support</h3>
              </div>
              <p className="text-slate-400 mb-4">Upload multiple tables and create complex relationships</p>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Multiple table uploads</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>JOIN operations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Schema management</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 text-lg font-semibold shadow-lg">
              Upgrade to Premium
            </button>
            <p className="text-slate-400 mt-4">Starting at $9.99/month • Cancel anytime</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Bar */}
      <ResponsiveNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Database className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Custom Database Upload</h1>
            <Crown className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-slate-400">Upload your own datasets and practice SQL queries on real data</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">Upload Your Database</h2>
              
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                  isDragging 
                    ? 'border-blue-400 bg-blue-400/10' 
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {isDragging ? 'Drop your file here' : 'Drag & drop your database file'}
                    </h3>
                    <p className="text-slate-400 mb-4">or</p>
                    <button
                      onClick={handleFileSelect}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.sqlite,.db"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Supported Formats */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Supported Formats:</h4>
                <div className="grid grid-cols-3 gap-4">
                  {supportedFormats.map((format) => (
                    <div key={format.ext} className="flex items-center space-x-2 text-sm text-slate-400">
                      <format.icon className="w-4 h-4" />
                      <span>{format.ext}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Table Name */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Custom Table Name (Optional)
                </label>
                <input
                  type="text"
                  value={customTableName}
                  onChange={(e) => setCustomTableName(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter custom table name..."
                />
              </div>

              {/* Upload Status */}
              {uploadStatus.isUploading && (
                <div className="mt-6 bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                    <span className="text-white font-medium">Uploading...</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadStatus.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{uploadStatus.progress}% complete</p>
                </div>
              )}

              {uploadStatus.error && (
                <div className="mt-6 bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">{uploadStatus.error}</span>
                </div>
              )}

              {uploadStatus.success && (
                <div className="mt-6 bg-green-500/20 border border-green-500 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">File uploaded successfully!</span>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center space-x-2 mb-4">
                <Info className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Upload Guidelines</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2" />
                  <span>Maximum file size: 50MB</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2" />
                  <span>CSV files should have proper headers</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2" />
                  <span>JSON files should be array of objects</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2" />
                  <span>SQLite files are directly imported</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Data Security</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>Your data is encrypted at rest</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>Only you can access your databases</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>Data is automatically deleted after 30 days of inactivity</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Tables Section */}
        {uploadedTables.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Your Uploaded Databases</h2>
            <div className="grid lg:grid-cols-2 gap-6">
              {uploadedTables.map((table) => {
                const FileIcon = getFileTypeIcon(table.fileType);
                return (
                  <div key={table.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    {/* Table Header */}
                    <div className="p-6 border-b border-slate-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getFileTypeColor(table.fileType)}`}>
                            <FileIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{table.name}</h3>
                            <p className="text-sm text-slate-400">{table.fileName}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveTable(table.id)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Rows:</span>
                          <p className="text-white font-medium">{table.rowCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Size:</span>
                          <p className="text-white font-medium">{table.size}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Uploaded:</span>
                          <p className="text-white font-medium">{table.uploadDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Schema Preview */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-slate-300">Schema ({table.columns.length} columns)</h4>
                        <button
                          onClick={() => setShowPreview(showPreview === table.id ? null : table.id)}
                          className="text-blue-400 hover:text-blue-300 transition-colors text-sm flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>{showPreview === table.id ? 'Hide' : 'Preview'}</span>
                        </button>
                      </div>

                      <div className="space-y-2 mb-4">
                        {table.columns.slice(0, 4).map((column) => (
                          <div key={column.name} className="flex items-center justify-between text-sm">
                            <span className="text-white font-mono">{column.name}</span>
                            <span className="text-slate-400">{column.type}</span>
                          </div>
                        ))}
                        {table.columns.length > 4 && (
                          <p className="text-xs text-slate-500">+{table.columns.length - 4} more columns</p>
                        )}
                      </div>

                      {/* Data Preview */}
                      {showPreview === table.id && (
                        <div className="bg-slate-900 rounded-lg p-4 mb-4 border border-slate-700">
                          <h5 className="text-sm font-medium text-slate-300 mb-3">Data Preview</h5>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="border-b border-slate-700">
                                  {Object.keys(table.preview[0] || {}).map((key) => (
                                    <th key={key} className="text-left text-slate-400 py-2 pr-4 font-medium">
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.preview.map((row, index) => (
                                  <tr key={index} className="border-b border-slate-700/50">
                                    {Object.values(row).map((value, cellIndex) => (
                                      <td key={cellIndex} className="text-slate-300 py-2 pr-4">
                                        {String(value)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleLoadToPlayground(table)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Load into Playground</span>
                        </button>
                        <button className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
