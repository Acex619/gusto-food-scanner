/**
 * Validation utilities for user inputs and data security
 */

// Common barcode formats and their validation patterns
const BARCODE_PATTERNS = {
  UPC_A: /^\d{12}$/,
  UPC_E: /^\d{8}$/,
  EAN_13: /^\d{13}$/,
  EAN_8: /^\d{8}$/,
  CODE_128: /^[\x00-\x7F]+$/,
  CODE_39: /^[A-Z0-9\-\.\s\$\/\+\%]+$/
};

/**
 * Validates if a barcode string is in a valid format
 */
export function validateBarcode(barcode: string): boolean {
  if (!barcode || typeof barcode !== 'string') {
    return false;
  }

  const cleanBarcode = barcode.trim();
  
  // Check against known barcode patterns
  return Object.values(BARCODE_PATTERNS).some(pattern => 
    pattern.test(cleanBarcode)
  );
}

/**
 * Sanitizes barcode input to prevent XSS and injection attacks
 */
export function sanitizeBarcode(barcode: string): string {
  if (!barcode || typeof barcode !== 'string') {
    return '';
  }

  // Remove any non-alphanumeric characters except common barcode symbols
  return barcode.replace(/[^A-Za-z0-9\-\.\s\$\/\+\%]/g, '').trim();
}

/**
 * Validates file uploads (for image scanning)
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
  }

  return { valid: true };
}

/**
 * Rate limiting utility for client-side protection
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 10, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(time => now - time < this.timeWindow);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const scanRateLimiter = new RateLimiter(10, 60000); // 10 scans per minute