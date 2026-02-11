import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

interface FileUploadProps {
  category: 'lab_results' | 'genetic_data' | 'medical_reports' | 'wearable_data' | 'health_metrics';
  onUploadSuccess?: () => void;
  acceptedFormats?: string;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  category,
  onUploadSuccess,
  acceptedFormats = '.pdf,.csv,.json,.txt',
  maxSizeMB = 10
}) => {
  const { getAccessToken, user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setUploadStatus('error');
      setMessage(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    setSelectedFile(file);
    setUploadStatus('idle');
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus('idle');
    setMessage('');

    try {
      // Get Auth0 token
      const token = await getAccessToken();

      // Create FormData
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);

      // Upload file
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      console.log('✅ Upload successful:', data);

      setUploadStatus('success');
      setMessage(`Successfully uploaded ${selectedFile.name}`);
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Call success callback
      if (onUploadSuccess) {
        setTimeout(() => {
          onUploadSuccess();
        }, 1500);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setMessage('');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const getCategoryLabel = () => {
    const labels = {
      lab_results: 'Lab Results',
      genetic_data: 'Genetic Data',
      medical_reports: 'Medical Reports',
      wearable_data: 'Wearable Data',
      health_metrics: 'Health Metrics'
    };
    return labels[category] || 'Health Data';
  };

  return (
    <div className="w-full">
      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Upload {getCategoryLabel()}
        </label>
        <div className="flex items-center space-x-3">
          <label
            htmlFor="file-input"
            className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-500/10 transition-colors"
          >
            <Upload className="w-5 h-5 text-white/70 mr-2" />
            <span className="text-white/70">
              {selectedFile ? selectedFile.name : 'Choose file...'}
            </span>
          </label>
          <input
            id="file-input"
            type="file"
            accept={acceptedFormats}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {selectedFile && !uploading && (
            <button
              onClick={clearFile}
              className="p-3 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
              title="Clear file"
            >
              <X className="w-5 h-5 text-red-400" />
            </button>
          )}
        </div>

        <p className="text-xs text-white/50 mt-2">
          Accepted formats: {acceptedFormats.split(',').join(', ')} (max {maxSizeMB}MB)
        </p>
      </div>

      {/* Upload Button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploading || uploadStatus === 'success'}
          className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            uploading
              ? 'bg-blue-600/50 cursor-not-allowed'
              : uploadStatus === 'success'
              ? 'bg-green-600 cursor-default'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Uploaded!</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span>Upload File</span>
            </>
          )}
        </button>
      )}

      {/* Status Messages */}
      {message && (
        <div
          className={`mt-4 p-3 rounded-lg flex items-start space-x-2 ${
            uploadStatus === 'success'
              ? 'bg-green-500/20 border border-green-500/50'
              : 'bg-red-500/20 border border-red-500/50'
          }`}
        >
          {uploadStatus === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${uploadStatus === 'success' ? 'text-green-100' : 'text-red-100'}`}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
