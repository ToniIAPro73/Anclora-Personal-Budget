import { auth } from "@/lib/auth";

/**
 * Get authenticated user with development mode bypass
 * 
 * In development, if no session exists, returns the synthetic user
 * to allow testing with generated data without requiring login.
 * 
 * In production, requires valid authentication.
 */
export async function getAuthenticatedUser() {
  const session = await auth();
  
  // Return authenticated user if session exists
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || '',
    };
  }
  
  // In development, use synthetic user if no session
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'synthetic-user-001',
      email: 'usuario@anclora.com',
      name: 'Usuario',
    };
  }
  
  // In production, require authentication
  return null;
}
