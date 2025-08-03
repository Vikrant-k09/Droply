import mongoose from 'mongoose';
import File from './models/File.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanupMockFiles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all files with mock URLs
    const mockFiles = await File.find({
      cloudinaryUrl: { $regex: /example\.com\/mock/ }
    });

    console.log(`Found ${mockFiles.length} mock files to clean up`);

    if (mockFiles.length > 0) {
      // Get all user IDs that have mock files
      const userIds = [...new Set(mockFiles.map(file => file.owner.toString()))];
      
      // Remove mock files from database
      await File.deleteMany({
        cloudinaryUrl: { $regex: /example\.com\/mock/ }
      });

      // Reset storage usage for affected users
      for (const userId of userIds) {
        const user = await User.findById(userId);
        if (user) {
          // Recalculate storage from remaining files
          const userFiles = await File.find({ owner: userId });
          const totalStorage = userFiles.reduce((sum, file) => sum + file.size, 0);
          
          user.storageUsed = totalStorage;
          user.files = userFiles.map(file => file._id);
          await user.save();
          
          console.log(`Updated storage for user ${userId}: ${totalStorage} bytes`);
        }
      }

      console.log('✅ Cleanup completed successfully!');
      console.log('You can now upload new files that will use Cloudinary properly.');
    } else {
      console.log('✅ No mock files found - database is clean!');
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

cleanupMockFiles();
