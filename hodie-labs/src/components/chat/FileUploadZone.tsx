import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Image, AlertCircle, CheckCircle, X } from 'lucide-react';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: 'lab_results' | 'genetic_data' | 'medical_images' | 'health_reports' | 'other';
  status: 'uploading' | 'success' | 'error';
  progress: number;
  previewData?: any;
}

interface FileUploadZoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onFileRemove: (fileId: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  isVisible: boolean;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  onFileRemove,
  acceptedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.csv', '.xlsx', '.xls', '.txt', '.json', '.xml', '.rtf'],
  maxSize = 10, // 10MB default
  isVisible
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoriseFile = (file: File): UploadedFile['category'] => {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();

    // Lab results
    if (name.includes('lab') || name.includes('blood') || name.includes('test') || 
        name.includes('pathology') || name.includes('biomarker')) {
      return 'lab_results';
    }
    
    // Genetic data
    if (name.includes('23andme') || name.includes('ancestry') || name.includes('dna') || 
        name.includes('genetic') || name.includes('genome') || type.includes('vcf')) {
      return 'genetic_data';
    }
    
    // Medical images
    if (type.startsWith('image/') || name.includes('scan') || name.includes('xray') || 
        name.includes('mri') || name.includes('ct')) {
      return 'medical_images';
    }
    
    // Health reports
    if (name.includes('report') || name.includes('summary') || name.includes('health')) {
      return 'health_reports';
    }
    
    return 'other';
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${maxSize}MB limit` };
    }

    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return { valid: false, error: `File type ${extension} not supported` };
    }

    return { valid: true };
  };

  const processFiles = useCallback(async (files: FileList) => {
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}_${i}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        category: categoriseFile(file),
        status: validation.valid ? 'uploading' : 'error',
        progress: validation.valid ? 0 : 100
      };

      newFiles.push(uploadedFile);
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Process valid files and collect successful ones
    const validFiles = newFiles.filter(f => f.status === 'uploading');
    const successfulFiles: UploadedFile[] = [];

    for (const uploadFile of validFiles) {
      const processedFile = await simulateUpload(uploadFile);
      if (processedFile) {
        successfulFiles.push(processedFile);
      }
    }

    // FIXED: Call onFilesUploaded AFTER all files have been processed successfully
    console.log(`📁 Calling onFilesUploaded with ${successfulFiles.length} successfully processed files`);
    if (successfulFiles.length > 0) {
      onFilesUploaded(successfulFiles);
    } else {
      console.warn('⚠️ No files were successfully processed');
    }
  }, [onFilesUploaded, acceptedTypes, maxSize]);

  const simulateUpload = async (file: UploadedFile): Promise<UploadedFile | null> => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadedFiles(prev =>
          prev.map(f => f.id === file.id ? { ...f, progress } : f)
        );
      }

      // Process file content
      const previewData = await extractFilePreview(file.file);

      // Create the successful file object
      const successfulFile: UploadedFile = {
        ...file,
        status: 'success',
        progress: 100,
        previewData
      };

      // Update state
      setUploadedFiles(prev =>
        prev.map(f => f.id === file.id ? successfulFile : f)
      );

      console.log(`✅ File processed successfully: ${file.name}`);
      return successfulFile;
    } catch (error) {
      console.error(`❌ Error processing file ${file.name}:`, error);

      // Update state to error
      setUploadedFiles(prev =>
        prev.map(f => f.id === file.id ? { ...f, status: 'error', progress: 100 } : f)
      );

      return null;
    }
  };

  const extractFilePreview = async (file: File): Promise<any> => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      switch (extension) {
        case 'csv':
          return await parseCsvPreview(file);
        case 'json':
          return await parseJsonPreview(file);
        case 'txt':
          return await parseTextPreview(file);
        case 'pdf':
          return { type: 'pdf', pages: '~5 pages', size: formatFileSize(file.size) };
        default:
          if (file.type.startsWith('image/')) {
            return { type: 'image', url: URL.createObjectURL(file) };
          }
          return { type: 'unknown' };
      }
    } catch (error) {
      console.error('Error extracting file preview:', error);
      return { type: 'error', message: 'Could not preview file' };
    }
  };

  const parseCsvPreview = async (file: File): Promise<any> => {
    const text = await file.text();
    const lines = text.split('\n').slice(0, 5); // First 5 lines
    return {
      type: 'csv',
      headers: lines[0]?.split(',') || [],
      rows: lines.slice(1).map(line => line.split(',')),
      totalRows: text.split('\n').length - 1
    };
  };

  const parseJsonPreview = async (file: File): Promise<any> => {
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      return {
        type: 'json',
        keys: Object.keys(data).slice(0, 10),
        structure: Array.isArray(data) ? 'array' : 'object',
        length: Array.isArray(data) ? data.length : Object.keys(data).length
      };
    } catch {
      return { type: 'json', error: 'Invalid JSON format' };
    }
  };

  const parseTextPreview = async (file: File): Promise<any> => {
    const text = await file.text();
    return {
      type: 'text',
      preview: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      lines: text.split('\n').length,
      words: text.split(/\s+/).length
    };
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    onFileRemove(fileId);
  };

  const getCategoryIcon = (category: UploadedFile['category']) => {
    switch (category) {
      case 'lab_results': return '🧪';
      case 'genetic_data': return '🧬';
      case 'medical_images': return '📸';
      case 'health_reports': return '📊';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: UploadedFile['category']) => {
    switch (category) {
      case 'lab_results': return 'bg-blue-50 border-blue-200';
      case 'genetic_data': return 'bg-purple-50 border-purple-200';
      case 'medical_images': return 'bg-green-50 border-green-200';
      case 'health_reports': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-full">
      {/* Upload Zone - Mobile optimized */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer touch-manipulation active:scale-95 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        aria-label="Upload health files"
      >
        <Upload className="w-10 h-10 md:w-8 md:h-8 text-blue-500 mx-auto mb-3" />
        <p className="text-base md:text-sm text-gray-700 mb-2 font-medium">
          Tap to select files
        </p>
        <p className="text-xs text-gray-500 mb-1">
          or drag & drop (desktop only)
        </p>
        <p className="text-xs text-gray-500 mb-2">
          Lab results • DNA data • Reports • Images
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
        >
          Choose Files
        </button>
        <p className="text-xs text-gray-400 mt-3">
          Max {maxSize}MB per file
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className={`border rounded-lg p-3 ${getCategoryColor(file.category)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <span className="text-lg flex-shrink-0">
                    {getCategoryIcon(file.category)}
                  </span>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-centre space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                      
                      {file.status === 'uploading' && (
                        <div className="w-4 h-4">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                      
                      {file.status === 'success' && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      
                      {file.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>

                    <div className="flex items-centre space-x-2 mt-1">
                      <span className="text-xs px-2 py-1 bg-white rounded-full border">
                        {file.category.replace('_', ' ')}
                      </span>
                      
                      {file.status === 'uploading' && (
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* File Preview */}
                    {file.previewData && file.status === 'success' && (
                      <div className="mt-2 text-xs text-gray-600">
                        {file.previewData.type === 'csv' && (
                          <div>
                            <p>📊 {file.previewData.totalRows} rows, {file.previewData.headers.length} columns</p>
                            <p className="mt-1">Headers: {file.previewData.headers.slice(0, 3).join(', ')}{file.previewData.headers.length > 3 ? '...' : ''}</p>
                          </div>
                        )}
                        
                        {file.previewData.type === 'json' && (
                          <div>
                            <p>📝 {file.previewData.structure} with {file.previewData.length} items</p>
                            <p className="mt-1">Keys: {file.previewData.keys?.slice(0, 3).join(', ')}{file.previewData.keys?.length > 3 ? '...' : ''}</p>
                          </div>
                        )}
                        
                        {file.previewData.type === 'text' && (
                          <div>
                            <p>📄 {file.previewData.lines} lines, {file.previewData.words} words</p>
                            <p className="mt-1 italic">"{file.previewData.preview}"</p>
                          </div>
                        )}
                        
                        {file.previewData.type === 'image' && (
                          <div className="mt-2">
                            <img 
                              src={file.previewData.url} 
                              alt="Preview" 
                              className="max-w-20 max-h-16 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Upload Suggestions */}
      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium mb-1">💡 Popular file types:</p>
        <ul className="space-y-1">
          <li>• Lab results: CSV, PDF reports from pathology labs</li>
          <li>• Genetic data: 23andMe, AncestryDNA raw data files</li>
          <li>• Health reports: PDF summaries, medical imaging</li>
          <li>• Wearable data: JSON exports from fitness trackers</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadZone;