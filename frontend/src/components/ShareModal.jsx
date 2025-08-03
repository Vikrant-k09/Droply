import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { QRCodeSVG } from 'qrcode.react';
import { copyToClipboard } from '../lib/helpers';
import toast from 'react-hot-toast';
import { X, Copy, QrCode, Download, Share2 } from 'lucide-react';

export default function ShareModal({ file, onClose }) {
  const [customMessage, setCustomMessage] = useState('');
  const baseShareLink = `${window.location.origin}/share/${file.shareLink}`;
  const shareLink = customMessage 
    ? `${baseShareLink}?message=${encodeURIComponent(customMessage)}`
    : baseShareLink;
  const qrRef = useRef();

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareLink);
    if (success) {
      toast.success('Link copied to clipboard');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const downloadQR = () => {
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `${file.originalName}-qr.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const shareViaWebAPI = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Download ${file.originalName}`,
          text: customMessage || `Download my file: ${file.originalName}`,
          url: shareLink
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      toast.error('Web Share API not supported');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-md max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-white text-xl font-semibold">Share File</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* File Info */}
          <div className="text-center py-2">
            <h3 className="text-lg font-semibold text-white mb-1 break-words">
              {file.originalName}
            </h3>
            <p className="text-gray-400 text-sm">
              Ready to share with others
            </p>
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 block">
              Share Link
            </label>
            <div className="flex space-x-2">
              <Input
                value={shareLink}
                readOnly
                className="bg-gray-700 border-gray-600 text-white text-sm flex-1 min-w-0"
              />
              <Button
                onClick={handleCopyLink}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 px-3"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center space-y-4">
            <label className="text-sm font-medium text-gray-300 block">
              QR Code
            </label>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg inline-block" ref={qrRef}>
                <QRCodeSVG
                  value={shareLink}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              </div>
            </div>
            <Button
              onClick={downloadQR}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
          </div>

          {/* Custom Message */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 block">
              Custom Message (Optional)
            </label>
            <Input
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a message for the recipient..."
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            {navigator.share && (
              <Button
                onClick={shareViaWebAPI}
                className="bg-green-500 hover:bg-green-600 flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            <Button
              onClick={handleCopyLink}
              className="bg-blue-500 hover:bg-blue-600 flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>

          {/* Custom Message Preview */}
          {customMessage && (
            <div className="mt-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
              <h4 className="text-sm font-medium text-gray-300 mb-1">Preview Message:</h4>
              <p className="text-white text-sm">{customMessage}</p>
              <p className="text-gray-400 text-xs mt-1">
                This message will be shown when someone opens your share link
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
