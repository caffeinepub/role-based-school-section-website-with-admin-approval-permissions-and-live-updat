/**
 * Utility functions for extracting and categorizing admin-related errors.
 * Provides both detailed error messages for console logging and sanitized user-facing messages.
 */

export type ErrorCategory = 'canister-stopped' | 'authorization' | 'generic';

/**
 * Extract detailed error message from various error types (for console logging)
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

/**
 * Check if error is a canister-stopped error
 */
export function isCanisterStoppedError(error: unknown): boolean {
  const message = getErrorMessage(error);
  return message.includes('is stopped') || 
         message.includes('IC0508') ||
         message.includes('CallContextManager');
}

/**
 * Categorize error into one of three types
 */
export function categorizeError(error: unknown): ErrorCategory {
  const message = getErrorMessage(error);
  
  // Check canister-stopped first (highest priority)
  if (isCanisterStoppedError(error)) {
    return 'canister-stopped';
  }
  
  // Check authorization errors
  if (message.includes('Unauthorized') || 
      message.includes('Access denied') ||
      message.includes('permission')) {
    return 'authorization';
  }
  
  // Default to generic
  return 'generic';
}

/**
 * Get user-facing error message (sanitized, no technical details)
 */
export function getUserFacingMessage(error: unknown): string {
  const category = categorizeError(error);
  
  switch (category) {
    case 'canister-stopped':
      return 'The service is temporarily unavailable. Please try again in a few moments.';
    case 'authorization':
      return 'Could not load data. Please log in again and retry.';
    default:
      return 'Could not load data. Please try again.';
  }
}
