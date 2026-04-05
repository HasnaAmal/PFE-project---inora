import express from 'express';
import { protect } from '../Middlewares/auth.js';
import upload from '../Middlewares/upload.js';
import {
  getMyProfile,
  updateMyName,
  updateMyEmail,
  updateMyPassword,
  updateMyAvatar,
  verifyMyPassword,
  deleteMyAccount,
  cancelMyBooking,
} from '../Controllers/profile.js';

const router = express.Router();

// ──────────────────────────────────────────────────────────────────
// GET /api/profile/me - Get current user profile
// ──────────────────────────────────────────────────────────────────
router.get('/me', protect, getMyProfile);

// ✅ ADD THIS - For frontend compatibility (calls /api/profile/me)
router.get('/profile/me', protect, getMyProfile);

// ──────────────────────────────────────────────────────────────────
// PATCH /api/profile/me/avatar - Update avatar
// ──────────────────────────────────────────────────────────────────
router.patch('/me/avatar', protect, upload.single('avatar'), updateMyAvatar);

// ──────────────────────────────────────────────────────────────────
// PATCH /api/profile/me/name - Update full name
// ──────────────────────────────────────────────────────────────────
router.patch('/me/name', protect, updateMyName);

// ──────────────────────────────────────────────────────────────────
// PATCH /api/profile/me/email - Update email
// ──────────────────────────────────────────────────────────────────
router.patch('/me/email', protect, updateMyEmail);

// ──────────────────────────────────────────────────────────────────
// PATCH /api/profile/me/password - Update password
// ──────────────────────────────────────────────────────────────────
router.patch('/me/password', protect, updateMyPassword);

// ──────────────────────────────────────────────────────────────────
// POST /api/profile/me/verify-password - Verify password for sensitive actions
// ──────────────────────────────────────────────────────────────────
router.post('/me/verify-password', protect, verifyMyPassword);

// ──────────────────────────────────────────────────────────────────
// DELETE /api/profile/me - Delete account (requires admin code)
// ──────────────────────────────────────────────────────────────────
router.delete('/me', protect, deleteMyAccount);

// ──────────────────────────────────────────────────────────────────
// PATCH /api/profile/me/bookings/:id/cancel - Cancel a booking
// ──────────────────────────────────────────────────────────────────
router.patch('/me/bookings/:id/cancel', protect, cancelMyBooking);

// ✅ IMPORTANT: Export router as default
export default router;