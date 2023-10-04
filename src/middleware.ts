import { authMiddleware } from '@kinde-oss/kinde-auth-nextjs/server';

// kinde implementation
export const config = {
  matcher: ['/dashboard/:path*', '/auth-callback'],
};

export default authMiddleware;
