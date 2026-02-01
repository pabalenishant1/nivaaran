// Centralized configuration for the application

// The backend URL. Use environment variable if available, otherwise default to the Railway production URL.
// We use NEXT_PUBLIC_ prefix to make it available to the client-side code if needed.
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://nivaaran-backend-production.up.railway.app';
