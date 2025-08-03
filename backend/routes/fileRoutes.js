import express from 'express';
import {
  uploadFiles,
  getUserFiles,
  getFileByShareLink,
  downloadFile,
  updateFileSharing,
  generateNewShareLink,
  deleteFile,
  getFileStats
} from '../controllers/fileController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { validateFileSharing } from '../middleware/validation.js';

const router = express.Router();

// File upload
router.post('/upload', authenticate, upload.array('files', 5), uploadFiles);

// Get user's files
router.get('/', authenticate, getUserFiles);

// Get file statistics
router.get('/stats', authenticate, getFileStats);

// Get file by share link (public access with optional auth)
router.get('/share/:shareLink', optionalAuth, getFileByShareLink);

// Download file (public access with optional auth)
router.get('/download/:shareLink', optionalAuth, downloadFile);

// Update file sharing settings
router.put('/:fileId/share', authenticate, validateFileSharing, updateFileSharing);

// Generate new share link
router.post('/:fileId/new-link', authenticate, generateNewShareLink);

// Delete file
router.delete('/:fileId', authenticate, deleteFile);

export default router;
