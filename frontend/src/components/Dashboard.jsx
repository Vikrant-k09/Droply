import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { filesAPI } from '../lib/api';
import { formatFileSize, getFileIcon, truncateFilename, copyToClipboard } from '../lib/helpers';
import toast from 'react-hot-toast';
import { 
  Upload, 
  Share2, 
  Download, 
  Trash2, 
  Copy, 
  QrCode,
  LogOut,
  User,
  Settings,
  Plus
} from 'lucide-react';
import FileUpload from './FileUpload';
import ShareModal from './ShareModal';
import ImagePreview from './ImagePreview';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function Dashboard() {
  const { user, logout, updateUser } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [storageUsed, setStorageUsed] = useState(0);

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    // Initialize storage used from user data
    if (user?.storageUsed !== undefined) {
      setStorageUsed(user.storageUsed);
    }
  }, [user]);

  const fetchFiles = async () => {
    try {
      const response = await filesAPI.getUserFiles();
      setFiles(response.data.files);
      
      // Calculate storage used from current files
      const totalStorage = response.data.files.reduce((sum, file) => sum + file.size, 0);
      setStorageUsed(totalStorage);
      
      // Also update the user context
      updateUser(prevUser => ({ ...prevUser, storageUsed: totalStorage }));
    } catch (error) {
      toast.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const response = await filesAPI.deleteFile(fileId);
      const updatedFiles = files.filter(file => file.id !== fileId);
      setFiles(updatedFiles);
      
      // Calculate new storage from remaining files
      const newStorageUsed = updatedFiles.reduce((sum, file) => sum + file.size, 0);
      setStorageUsed(newStorageUsed);
      
      // Update user context
      updateUser(prevUser => ({ ...prevUser, storageUsed: newStorageUsed }));
      
      toast.success('File deleted successfully');
      setShowDeleteModal(false);
      setFileToDelete(null);
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (fileToDelete) {
      handleDeleteFile(fileToDelete.id);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setFileToDelete(null);
  };

  const handleCopyLink = async (shareLink) => {
    const link = `${window.location.origin}/share/${shareLink}`;
    const success = await copyToClipboard(link);
    if (success) {
      toast.success('Link copied to clipboard');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleShareFile = (file) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const handlePreviewFile = (file) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold">Droply</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Hi, {user?.username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Total Files</CardTitle>
              <div className="text-2xl font-bold text-white">{files.length}</div>
            </CardHeader>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Storage Used</CardTitle>
              <div className="text-2xl font-bold text-white">
                {formatFileSize(storageUsed)}
              </div>
            </CardHeader>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Storage Limit</CardTitle>
              <div className="text-2xl font-bold text-white">
                {formatFileSize(user?.storageLimit || 0)}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Files</h2>
            <Button 
              onClick={() => setShowUpload(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>

          {files.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="text-center py-12">
                <Upload className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No files uploaded yet</h3>
                <p className="text-gray-400 mb-4">Upload your first file to get started</p>
                <Button 
                  onClick={() => setShowUpload(true)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Upload Files
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {files.map((file) => (
                <Card key={file.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getFileIcon(file.mimetype)}</span>
                        <div>
                          <button
                            onClick={() => handlePreviewFile(file)}
                            className="text-left hover:text-blue-400 transition-colors"
                          >
                            <h3 className="font-medium text-white hover:text-blue-400 transition-colors">
                              {truncateFilename(file.originalName)}
                            </h3>
                          </button>
                          <p className="text-sm text-gray-400">
                            {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyLink(file.shareLink)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleShareFile(file)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(file)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showUpload && (
        <FileUpload 
          onClose={() => setShowUpload(false)}
          onUploadComplete={(newFiles, storageUsedFromServer) => {
            const updatedFiles = [...newFiles, ...files];
            setFiles(updatedFiles);
            
            // Calculate storage from all files or use server value
            const newStorageUsed = storageUsedFromServer !== undefined 
              ? storageUsedFromServer 
              : updatedFiles.reduce((sum, file) => sum + file.size, 0);
            
            setStorageUsed(newStorageUsed);
            updateUser(prevUser => ({ ...prevUser, storageUsed: newStorageUsed }));
            
            setShowUpload(false);
          }}
        />
      )}

      {showShareModal && selectedFile && (
        <ShareModal
          file={selectedFile}
          onClose={() => {
            setShowShareModal(false);
            setSelectedFile(null);
          }}
        />
      )}

      {showPreview && previewFile && (
        <ImagePreview
          file={previewFile}
          isOpen={showPreview}
          onClose={handleClosePreview}
          onShare={handleShareFile}
        />
      )}

      {showDeleteModal && fileToDelete && (
        <DeleteConfirmModal
          fileName={fileToDelete.originalName}
          isOpen={showDeleteModal}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
