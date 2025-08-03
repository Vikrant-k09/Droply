import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateUserRegistration,
  validateUserLogin
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

export default router;
