import File from '../models/File.js';
import User from '../models/User.js';
import QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Configure Cloudinary directly
cloudinary.config({
  cloud_name: 'da0108tmu',
  api_key: '758945264667573',
  api_secret: '22m4CS--edyRcsTKTXs1jMQMA6k',
});

console.log('Direct Cloudinary Config Applied');

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (fileBuffer, originalName, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      public_id: `droply/${Date.now()}_${originalName.replace(/[^a-zA-Z0-9]/g, '_')}`,
      use_filename: true,
      unique_filename: false
    };

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(fileBuffer);
  });
};

// @desc    Upload files
// @route   POST /api/files/upload
// @access  Private
export const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const user = await User.findById(req.user._id);
    const uploadedFiles = [];

    for (const file of req.files) {
      // Check user storage limit
      if (user.storageUsed + file.size > user.storageLimit) {
        return res.status(400).json({ 
          message: 'Storage limit exceeded. Please upgrade your plan or delete some files.' 
        });
      }

      try {
        // Upload file to Cloudinary
        const uploadPromise = new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'droply_files',
              public_id: `${user._id}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(file.buffer);
        });

        const uploadResult = await uploadPromise;

        // Create file record with actual Cloudinary URL
        const newFile = new File({
          filename: file.originalname,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          cloudinaryUrl: uploadResult.secure_url,
          cloudinaryPublicId: uploadResult.public_id,
          owner: user._id
        });

        await newFile.save();

        // Update user's files array and storage
        user.files.push(newFile._id);
        user.storageUsed += file.size;

        uploadedFiles.push({
          id: newFile._id,
          filename: newFile.filename,
          originalName: newFile.originalName,
          size: newFile.size,
          mimetype: newFile.mimetype,
          shareLink: newFile.shareLink,
          cloudinaryUrl: newFile.cloudinaryUrl,
          createdAt: newFile.createdAt
        });
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        return res.status(500).json({ 
          message: `Failed to upload file: ${file.originalname}` 
        });
      }
    }

    await user.save();

    res.status(201).json({
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      files: uploadedFiles,
      storageUsed: user.storageUsed,
      storageLimit: user.storageLimit
    });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({ message: 'Failed to upload files' });
  }
};

// @desc    Get user's files
// @route   GET /api/files
// @access  Private
export const getUserFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    const query = { owner: req.user._id };
    if (search) {
      query.$or = [
        { filename: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get files with pagination
    const files = await File.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-cloudinaryPublicId');

    const totalFiles = await File.countDocuments(query);
    const totalPages = Math.ceil(totalFiles / limit);

    res.json({
      files: files.map(file => ({
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        mimetype: file.mimetype,
        shareLink: file.shareLink,
        isPublic: file.isPublic,
        downloadCount: file.downloadCount,
        maxDownloads: file.maxDownloads,
        expiresAt: file.expiresAt,
        description: file.description,
        tags: file.tags,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalFiles,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({ message: 'Failed to fetch files' });
  }
};

// @desc    Get file by share link
// @route   GET /api/files/share/:shareLink
// @access  Public
export const getFileByShareLink = async (req, res) => {
  try {
    const { shareLink } = req.params;
    const { password } = req.query;

    const file = await File.findOne({ shareLink })
      .populate('owner', 'username');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if file is expired
    if (file.isExpired()) {
      return res.status(410).json({ message: 'File link has expired' });
    }

    // Check download limit
    if (file.isDownloadLimitExceeded()) {
      return res.status(410).json({ message: 'Download limit exceeded' });
    }

    // Check if file is password protected
    if (file.password) {
      if (!password) {
        return res.status(401).json({ 
          message: 'Password required',
          passwordRequired: true 
        });
      }

      const isPasswordValid = await bcrypt.compare(password, file.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }

    // Check if file is public or user is owner
    if (!file.isPublic && (!req.user || req.user._id.toString() !== file.owner._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      file: {
        id: file._id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        mimetype: file.mimetype,
        downloadUrl: file.cloudinaryUrl,
        downloadCount: file.downloadCount,
        description: file.description,
        owner: file.owner.username,
        createdAt: file.createdAt
      }
    });
  } catch (error) {
    console.error('Get file by share link error:', error);
    res.status(500).json({ message: 'Failed to fetch file' });
  }
};

// @desc    Download file
// @route   GET /api/files/download/:shareLink
// @access  Public
export const downloadFile = async (req, res) => {
  try {
    const { shareLink } = req.params;
    const { password } = req.query;

    const file = await File.findOne({ shareLink });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if file is expired
    if (file.isExpired()) {
      return res.status(410).json({ message: 'File link has expired' });
    }

    // Check download limit
    if (file.isDownloadLimitExceeded()) {
      return res.status(410).json({ message: 'Download limit exceeded' });
    }

    // Check password
    if (file.password) {
      if (!password) {
        return res.status(401).json({ 
          message: 'Password required',
          passwordRequired: true 
        });
      }

      const isPasswordValid = await bcrypt.compare(password, file.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }

    // Check access permissions
    if (!file.isPublic && (!req.user || req.user._id.toString() !== file.owner.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Increment download count
    file.downloadCount += 1;
    await file.save();

    // Redirect to Cloudinary URL for download
    res.redirect(file.cloudinaryUrl);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
};

// @desc    Update file sharing settings
// @route   PUT /api/files/:fileId/share
// @access  Private
export const updateFileSharing = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { 
      isPublic, 
      password, 
      expiresAt, 
      maxDownloads, 
      description, 
      tags 
    } = req.body;

    const file = await File.findOne({ 
      _id: fileId, 
      owner: req.user._id 
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Update file properties
    if (typeof isPublic === 'boolean') {
      file.isPublic = isPublic;
    }

    if (password) {
      const salt = await bcrypt.genSalt(12);
      file.password = await bcrypt.hash(password, salt);
    } else if (password === '') {
      file.password = null;
    }

    if (expiresAt) {
      file.expiresAt = new Date(expiresAt);
    } else if (expiresAt === null) {
      file.expiresAt = null;
    }

    if (maxDownloads) {
      file.maxDownloads = maxDownloads;
    } else if (maxDownloads === null) {
      file.maxDownloads = null;
    }

    if (description !== undefined) {
      file.description = description;
    }

    if (tags) {
      file.tags = tags;
    }

    await file.save();

    // Generate QR code for the share link
    const shareUrl = `${process.env.FRONTEND_URL}/share/${file.shareLink}`;
    const qrCode = await QRCode.toDataURL(shareUrl);
    file.qrCode = qrCode;
    await file.save();

    res.json({
      message: 'File sharing settings updated successfully',
      file: {
        id: file._id,
        shareLink: file.shareLink,
        shareUrl,
        qrCode: file.qrCode,
        isPublic: file.isPublic,
        hasPassword: !!file.password,
        expiresAt: file.expiresAt,
        maxDownloads: file.maxDownloads,
        description: file.description,
        tags: file.tags
      }
    });
  } catch (error) {
    console.error('Update file sharing error:', error);
    res.status(500).json({ message: 'Failed to update file sharing settings' });
  }
};

// @desc    Generate new share link
// @route   POST /api/files/:fileId/new-link
// @access  Private
export const generateNewShareLink = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOne({ 
      _id: fileId, 
      owner: req.user._id 
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Generate new share link
    const newShareLink = file.generateNewShareLink();
    await file.save();

    // Generate new QR code
    const shareUrl = `${process.env.FRONTEND_URL}/share/${newShareLink}`;
    const qrCode = await QRCode.toDataURL(shareUrl);
    file.qrCode = qrCode;
    await file.save();

    res.json({
      message: 'New share link generated successfully',
      shareLink: newShareLink,
      shareUrl,
      qrCode
    });
  } catch (error) {
    console.error('Generate new share link error:', error);
    res.status(500).json({ message: 'Failed to generate new share link' });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:fileId
// @access  Private
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findOne({ 
      _id: fileId, 
      owner: req.user._id 
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(file.cloudinaryPublicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Update user storage
    const user = await User.findById(req.user._id);
    user.storageUsed -= file.size;
    user.files.pull(file._id);
    await user.save();

    // Delete file record
    await File.findByIdAndDelete(fileId);

    res.json({ 
      message: 'File deleted successfully',
      storageUsed: user.storageUsed 
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

// @desc    Get file statistics
// @route   GET /api/files/stats
// @access  Private
export const getFileStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await File.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          totalDownloads: { $sum: '$downloadCount' },
          publicFiles: {
            $sum: { $cond: [{ $eq: ['$isPublic', true] }, 1, 0] }
          },
          privateFiles: {
            $sum: { $cond: [{ $eq: ['$isPublic', false] }, 1, 0] }
          }
        }
      }
    ]);

    const fileTypeStats = await File.aggregate([
      { $match: { owner: userId } },
      {
        $group: {
          _id: '$mimetype',
          count: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      stats: stats[0] || {
        totalFiles: 0,
        totalSize: 0,
        totalDownloads: 0,
        publicFiles: 0,
        privateFiles: 0
      },
      fileTypes: fileTypeStats
    });
  } catch (error) {
    console.error('Get file stats error:', error);
    res.status(500).json({ message: 'Failed to fetch file statistics' });
  }
};
