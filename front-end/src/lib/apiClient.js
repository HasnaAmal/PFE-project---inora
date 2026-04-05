// src/lib/apiClient.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,  // ✅ Utilise la variable d'env
  withCredentials: true,       // ✅ Important pour les cookies
  headers: {
    'Content-Type': 'application/json',
  },
});