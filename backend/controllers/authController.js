import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'Username is already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('files', 'filename originalName size createdAt')
      .select('-password');

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        storageUsed: user.storageUsed,
        storageLimit: user.storageLimit,
        filesCount: user.files.length,
        files: user.files
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const userId = req.user._id;

    // Check if username is taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(username && { username }),
        ...(avatar && { avatar })
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        storageUsed: updatedUser.storageUsed,
        storageLimit: updatedUser.storageLimit
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};
