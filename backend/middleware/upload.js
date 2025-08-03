import multer from 'multer';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  
  // List of allowed file types
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Documents
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    // Videos
    'video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/wmv',
    // Audio
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
    // Code files
    'text/javascript', 'application/json', 'text/css', 'text/html',
    'application/x-python-code', 'text/x-python'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 5 // Maximum 5 files at once
  },
  fileFilter: fileFilter
});

export default upload;
