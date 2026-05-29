// Base usada no NAVEGADOR (client components / formulários públicos).
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

// Base usada em fetches no SERVIDOR (Server Components / Route Handlers).
// Cai para a pública se BACKEND_API_URL não estiver definida.
export const SERVER_API_URL = process.env.BACKEND_API_URL ?? PUBLIC_API_URL;
