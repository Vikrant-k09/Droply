import mongoose from 'mongoose';
import crypto from 'crypto';

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  mimetype: {
    type: String,
    required: [true, 'File type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  cloudinaryUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  cloudinaryPublicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'File owner is required']
  },
  shareLink: {
    type: String,
    unique: true,
    default: function() {
      return crypto.randomBytes(16).toString('hex');
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  maxDownloads: {
    type: Number,
    default: null
  },
  qrCode: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Create index for shareLink
fileSchema.index({ shareLink: 1 });
fileSchema.index({ owner: 1 });
fileSchema.index({ createdAt: -1 });

// Check if file is expired
fileSchema.methods.isExpired = function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
};

// Check if download limit exceeded
fileSchema.methods.isDownloadLimitExceeded = function() {
  if (!this.maxDownloads) return false;
  return this.downloadCount >= this.maxDownloads;
};

// Generate new share link
fileSchema.methods.generateNewShareLink = function() {
  this.shareLink = crypto.randomBytes(16).toString('hex');
  return this.shareLink;
};

const File = mongoose.model('File', fileSchema);

export default File;
