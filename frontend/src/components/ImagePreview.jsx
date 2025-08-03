import { useState } from 'react';
import { X, Download, Share2, ExternalLink } from 'lucide-react';

const ImagePreview = ({ file, isOpen, onClose, onShare }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !file) return null;

  const isImage = file.mimetype?.startsWith('image/');
  const isPdf = file.mimetype === 'application/pdf';
  const isVideo = file.mimetype?.startsWith('video/');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.cloudinaryUrl || file.downloadUrl;
    link.download = file.originalName;
    link.target = '_blank';
    
    // Force download by adding fl_attachment to Cloudinary URL
    if ((file.cloudinaryUrl || file.downloadUrl)?.includes('cloudinary.com')) {
      link.href = (file.cloudinaryUrl || file.downloadUrl).replace('/upload/', '/upload/fl_attachment/');
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(file.cloudinaryUrl || file.downloadUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {file.originalName}
            </h3>
            <p className="text-sm text-gray-400">
              {file.mimetype} • {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            
            {onShare && (
              <button
                onClick={() => onShare(file)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isImage && (
            <div className="flex justify-center">
              {!imageLoaded && !imageError && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-400">Loading image...</div>
                </div>
              )}
              
              {imageError ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <div className="text-lg mb-2">Failed to load image</div>
                  <button
                    onClick={handleOpenInNewTab}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Open in new tab
                  </button>
                </div>
              ) : (
                <img
                  src={file.cloudinaryUrl || file.downloadUrl}
                  alt={file.originalName}
                  className={`max-w-full max-h-full object-contain rounded-lg ${!imageLoaded ? 'hidden' : ''}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          )}

          {isPdf && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="text-6xl mb-4">📄</div>
              <div className="text-lg mb-2">PDF Document</div>
              <div className="text-sm mb-4">Click below to view in a new tab</div>
              <button
                onClick={handleOpenInNewTab}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Open PDF
              </button>
            </div>
          )}

          {isVideo && (
            <div className="flex justify-center">
              <video
                src={file.cloudinaryUrl || file.downloadUrl}
                controls
                className="max-w-full max-h-full rounded-lg"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {!isImage && !isPdf && !isVideo && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="text-6xl mb-4">📁</div>
              <div className="text-lg mb-2">{file.mimetype || 'Unknown file type'}</div>
              <div className="text-sm mb-4">Preview not available for this file type</div>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download File
                </button>
                <button
                  onClick={handleOpenInNewTab}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
