export const BACKEND_URL = import.meta.env.VITE_EX_CP_BACKEND_URL
  ?? (import.meta.env.DEV ? 'https://localhost:3005' : '/api');

export const PATH_PING = '/ping';
export const SESSION_PATH = '/payment-session';
export const AUTHORISE_PATH = '/authorise';
export const VERIFY_AUTH_PATH = '/verify-auth';
