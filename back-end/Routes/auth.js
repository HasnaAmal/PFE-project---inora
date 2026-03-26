import express from 'express';
const router = express.Router();

import {
  login,
  register,
  resetPassword,
  forgotPassword,
  logout,
  getMe,
  getAdminUsers,
  toggleSuspendUser,
  updateAvatar,
  upload,
  updateName,
  updateEmail,
  updatePassword,
  deleteAccount,
} from '../Controllers/auth.js';

import { validations, errorValidatorHandler } from '../Middlewares/Validations.js';
import auth from '../Middlewares/auth.js';

// ── Public ──
router.post("/login",          validations.login,         errorValidatorHandler, login);
router.post("/register",       validations.register,      errorValidatorHandler, register);
router.post("/reset-password", validations.resetPassword, errorValidatorHandler, resetPassword);
router.post("/forgot-password",validations.forgotPassword,errorValidatorHandler, forgotPassword);
router.post("/logout",         logout);
router.get( "/me",             getMe);

// ── Profile (authenticated) ──
router.post(  '/avatar',          auth, upload.single('avatar'), updateAvatar);
router.patch( '/update-name',     auth, updateName);
router.patch( '/update-email',    auth, updateEmail);
router.patch( '/update-password', auth, updatePassword);
router.delete('/delete-account',  auth, deleteAccount);

// ── Admin ──
router.get(  '/admin/users',               auth, getAdminUsers);
router.patch('/admin/users/:id/suspend',   auth, toggleSuspendUser);

export default router;
