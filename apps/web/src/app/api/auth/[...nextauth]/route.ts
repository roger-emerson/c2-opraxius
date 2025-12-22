import { handlers } from '@/lib/auth';

// Export the GET and POST handlers from Auth.js
export const { GET, POST } = handlers;

// Required for Cloudflare Pages Edge Runtime
export const runtime = 'edge';

