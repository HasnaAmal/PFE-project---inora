import express from "express";
const router = express.Router();
import {
  login,
  register,
  resetPassword,
  forgotPassword,
  logout,
  getMe,
  getAdminUsers,     // ✅ add
  toggleSuspendUser  // ✅ add
} from '../Controllers/auth.js';

import { validations, errorValidatorHandler } from '../Middlewares/Validations.js';
import auth from '../Middlewares/auth.js'; // ✅ add — needed to protect admin routes

router.post("/login",          validations.login,          errorValidatorHandler, login);
router.post("/register",       validations.register,       errorValidatorHandler, register);
router.post("/reset-password", validations.resetPassword,  errorValidatorHandler, resetPassword);
router.post("/forgot-password",validations.forgotPassword, errorValidatorHandler, forgotPassword);
router.post("/logout",         logout);
router.get('/me',              getMe);

// ✅ admin routes
router.get('/admin/users',               auth, getAdminUsers);
router.patch('/admin/users/:id/suspend', auth, toggleSuspendUser);

export default router;
