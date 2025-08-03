import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';

const DeleteConfirmModal = ({ fileName, isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Delete File</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 mb-6">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">"{fileName}"</span>?
          </p>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
              This action cannot be undone. The file will be permanently deleted.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
