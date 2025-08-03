import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { filesAPI } from '../lib/api';
import { formatFileSize, getFileIcon } from '../lib/helpers';
import toast from 'react-hot-toast';
import { Download, ArrowLeft, AlertCircle, Eye } from 'lucide-react';
import ImagePreview from '../components/ImagePreview';

export default function SharePage() {
  const { shareLink } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Get custom message from URL query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const customMessage = searchParams.get('message');

  useEffect(() => {
    fetchFile();
  }, [shareLink]);

  const fetchFile = async () => {
    try {
      const response = await filesAPI.getFileByShareLink(shareLink);
      setFile(response.data.file);
    } catch (error) {
      setError(error.response?.data?.message || 'File not found');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Check if file has a download URL
      const downloadUrl = file.downloadUrl || file.cloudinaryUrl;
      if (!downloadUrl) {
        toast.error('Download URL not available');
        return;
      }

      // Create download link with Cloudinary URL
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.originalName;
      link.target = '_blank';
      
      // Force download by adding fl_attachment to Cloudinary URL if it's a Cloudinary URL
      if (downloadUrl.includes('cloudinary.com')) {
        link.href = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">File Not Found</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-white">Droply</span>
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white mb-2">
              Download File
            </CardTitle>
            <p className="text-gray-400">
              Someone shared this file with you
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Custom Message Section */}
            {customMessage && (
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">💬</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Message from sender:</h4>
                    <p className="text-gray-300 text-sm">
                      {decodeURIComponent(customMessage)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* File Preview */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">{getFileIcon(file.mimetype)}</span>
              </div>
              
              <div>
                <button
                  onClick={() => setShowPreview(true)}
                  className="hover:text-blue-400 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-white mb-1 hover:text-blue-400 transition-colors">
                    {file.originalName}
                  </h3>
                </button>
                <p className="text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            {/* File Info */}
            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">File Size:</span>
                <span className="text-white">{formatFileSize(file.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uploaded:</span>
                <span className="text-white">
                  {new Date(file.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white">{file.mimetype}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowPreview(true)}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 py-3"
              >
                <Eye className="h-5 w-5 mr-2" />
                Preview
              </Button>
              
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 py-3"
              >
                <Download className="h-5 w-5 mr-2" />
                {downloading ? 'Downloading...' : 'Download'}
              </Button>
            </div>

            {/* Security Notice */}
            <div className="text-center text-sm text-gray-500">
              <p>Always verify files from unknown sources before opening</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Preview Modal */}
      {showPreview && file && (
        <ImagePreview
          file={file}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
