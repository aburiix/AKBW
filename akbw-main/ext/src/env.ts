/**
 * Build-time injected credentials (ext/.env → Vite envPrefix "ADMIN_").
 * Used to obtain a JWT automatically via POST /api/admin/login.
 */
export const ADMIN_CREDENTIALS = {
  login: import.meta.env.ADMIN_LOGIN ?? "",
  password: import.meta.env.ADMIN_PASSWORD ?? "",
} as const;
