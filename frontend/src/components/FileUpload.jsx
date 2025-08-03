import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { filesAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Upload, X, File, Image, FileText, Video, Music } from 'lucide-react';
import { formatFileSize } from '../lib/helpers';

export default function FileUpload({ onClose, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error(`${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0
    }))]);
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const getFileIcon = (file) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (type.startsWith('video/')) return <Video className="h-5 w-5" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5" />;
    if (type.includes('text') || type.includes('document')) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach(fileItem => {
        formData.append('files', fileItem.file);
      });

      const response = await filesAPI.upload(formData);
      const uploadedFiles = response.data.files;
      const storageUsed = response.data.storageUsed;

      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      onUploadComplete(uploadedFiles, storageUsed);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Upload Files</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-gray-400 mb-4">
              Maximum file size: 50MB
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <Button
              onClick={() => document.getElementById('file-input').click()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Select Files
            </Button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              <h4 className="text-white font-medium">Selected Files</h4>
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">
                      {getFileIcon(fileItem.file)}
                    </span>
                    <div>
                      <p className="text-white font-medium">
                        {fileItem.file.name}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatFileSize(fileItem.file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileItem.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={files.length === 0 || uploading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
