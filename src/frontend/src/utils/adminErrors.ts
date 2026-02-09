/**
 * Utility functions for handling and categorizing admin-related errors
 */

/**
 * Extract a readable error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) return error.message;
  
  if (typeof error === 'object' && error !== null) {
    // Check for common error properties
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Try to stringify the error object
    try {
      return JSON.stringify(error);
    } catch {
      return 'An error occurred';
    }
  }
  
  return 'An unknown error occurred';
}

/**
 * Check if an error is likely an authorization/access denial error
 */
export function isAuthorizationError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  
  // Check for common authorization error patterns
  const authPatterns = [
    'unauthorized',
    'access denied',
    'permission denied',
    'not authorized',
    'forbidden',
    'only admins',
    'only administrators',
    'requires admin',
  ];
  
  return authPatterns.some(pattern => message.includes(pattern));
}
