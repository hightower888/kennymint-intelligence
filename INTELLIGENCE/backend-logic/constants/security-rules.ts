/**
 * Security Rules and Constants
 * Centralized security configuration for file storage, encryption, and access control
 */

import { createHash } from 'crypto';

// =============================================================================
// ENCRYPTION CONSTANTS
// =============================================================================

export const ENCRYPTION_CONFIG = {
  // Encryption algorithms
  SYMMETRIC_ALGORITHM: 'aes-256-gcm' as const,
  HASH_ALGORITHM: 'sha256' as const,
  KEY_DERIVATION: 'pbkdf2' as const,
  
  // Key specifications
  KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16, // 128 bits
  SALT_LENGTH: 32, // 256 bits
  TAG_LENGTH: 16, // 128 bits
  
  // Iteration counts
  PBKDF2_ITERATIONS: 100000,
  
  // Key rotation
  KEY_ROTATION_DAYS: 90,
  MAX_KEY_AGE: 90 * 24 * 60 * 60 * 1000, // 90 days in ms
} as const;

// =============================================================================
// ACCESS CONTROL RULES
// =============================================================================

export const ACCESS_CONTROL = {
  // File access levels
  ACCESS_LEVELS: {
    PUBLIC: 'public' as const,
    PRIVATE: 'private' as const,
    RESTRICTED: 'restricted' as const,
    CONFIDENTIAL: 'confidential' as const,
  },
  
  // Permission types
  PERMISSIONS: {
    READ: 'read' as const,
    WRITE: 'write' as const,
    DELETE: 'delete' as const,
    ADMIN: 'admin' as const,
  },
  
  // Default permissions by file type
  DEFAULT_PERMISSIONS: {
    'config/*': 'restricted' as const,
    'brand-guidelines/*': 'private' as const,
    'assets/public/*': 'public' as const,
    'assets/private/*': 'private' as const,
    'learning-data/*': 'confidential' as const,
    'workflows/*': 'private' as const,
  },
} as const;

// =============================================================================
// FILE VALIDATION RULES
// =============================================================================

export const FILE_VALIDATION = {
  // Allowed file extensions by category
  ALLOWED_EXTENSIONS: {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    documents: ['.pdf', '.doc', '.docx', '.txt', '.md'],
    videos: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    audio: ['.mp3', '.wav', '.ogg', '.aac'],
    configs: ['.json', '.yaml', '.yml', '.toml'],
    code: ['.js', '.ts', '.jsx', '.tsx', '.py', '.css', '.html'],
  },
  
  // Forbidden file patterns
  FORBIDDEN_PATTERNS: [
    /\.exe$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.scr$/i,
    /\.com$/i,
    /\.pif$/i,
    /\.vbs$/i,
    /\.js$/i, // JavaScript files in uploads
    /\.php$/i,
  ],
  
  // Content type validation
  MIME_TYPE_VALIDATION: true,
  EXTENSION_MIME_MATCH: true,
  
  // Malware scanning
  ENABLE_VIRUS_SCAN: true,
  QUARANTINE_SUSPICIOUS: true,
} as const;

// =============================================================================
// AUDIT AND LOGGING
// =============================================================================

export const AUDIT_CONFIG = {
  // What to log
  LOG_EVENTS: {
    FILE_CREATE: 'file_create' as const,
    FILE_READ: 'file_read' as const,
    FILE_UPDATE: 'file_update' as const,
    FILE_DELETE: 'file_delete' as const,
    ACCESS_DENIED: 'access_denied' as const,
    ENCRYPTION_KEY_ROTATION: 'key_rotation' as const,
    SECURITY_VIOLATION: 'security_violation' as const,
  },
  
  // Log retention
  LOG_RETENTION_DAYS: 365,
  SECURITY_LOG_RETENTION_DAYS: 2555, // 7 years for compliance
  
  // Alert thresholds
  FAILED_ACCESS_THRESHOLD: 5, // Failed attempts before alert
  SUSPICIOUS_ACTIVITY_THRESHOLD: 10, // Suspicious events before alert
  
  // Log levels
  LOG_LEVELS: {
    INFO: 'info' as const,
    WARN: 'warn' as const,
    ERROR: 'error' as const,
    CRITICAL: 'critical' as const,
  },
} as const;

// =============================================================================
// RATE LIMITING RULES
// =============================================================================

export const RATE_LIMITING = {
  // File operation limits (per minute)
  MAX_FILE_OPERATIONS_PER_MINUTE: 100,
  MAX_UPLOADS_PER_MINUTE: 10,
  MAX_DOWNLOADS_PER_MINUTE: 50,
  
  // API rate limits
  MAX_API_CALLS_PER_MINUTE: 1000,
  MAX_GENERATION_REQUESTS_PER_HOUR: 100,
  
  // Burst allowances
  BURST_ALLOWANCE_FACTOR: 2, // 2x normal rate for short bursts
  BURST_WINDOW_SECONDS: 60,
  
  // Cooldown periods
  VIOLATION_COOLDOWN_MINUTES: 15,
  REPEATED_VIOLATION_COOLDOWN_HOURS: 24,
} as const;

// =============================================================================
// DATA CLASSIFICATION
// =============================================================================

export const DATA_CLASSIFICATION = {
  // Sensitivity levels
  SENSITIVITY_LEVELS: {
    PUBLIC: {
      level: 1,
      encryption: false,
      backup: true,
      retention: 365, // days
    },
    INTERNAL: {
      level: 2,
      encryption: true,
      backup: true,
      retention: 2555, // 7 years
    },
    CONFIDENTIAL: {
      level: 3,
      encryption: true,
      backup: true,
      retention: 2555, // 7 years
      access_logging: true,
    },
    RESTRICTED: {
      level: 4,
      encryption: true,
      backup: true,
      retention: 3650, // 10 years
      access_logging: true,
      approval_required: true,
    },
  },
  
  // Auto-classification rules
  AUTO_CLASSIFY_PATTERNS: {
    'password': 'CONFIDENTIAL',
    'secret': 'CONFIDENTIAL',
    'key': 'CONFIDENTIAL',
    'token': 'CONFIDENTIAL',
    'brand': 'INTERNAL',
    'config': 'INTERNAL',
    'public': 'PUBLIC',
  },
} as const;

// =============================================================================
// COMPLIANCE RULES
// =============================================================================

export const COMPLIANCE = {
  // Regulatory frameworks
  FRAMEWORKS: {
    GDPR: {
      data_retention_days: 1095, // 3 years max without consent
      deletion_grace_period: 30, // days
      consent_required: true,
      right_to_erasure: true,
    },
    HIPAA: {
      encryption_required: true,
      access_logging: true,
      audit_trail_retention: 2555, // 7 years
      breach_notification_hours: 72,
    },
    SOX: {
      audit_trail_required: true,
      retention_years: 7,
      change_approval_required: true,
      segregation_of_duties: true,
    },
  },
  
  // Industry-specific rules
  INDUSTRY_RULES: {
    healthcare: 'HIPAA',
    finance: 'SOX',
    technology: 'GDPR',
    default: 'GDPR',
  },
} as const;

// =============================================================================
// SECURITY UTILITIES
// =============================================================================

export const SECURITY_UTILS = {
  // Generate secure file names
  generateSecureFileName: (originalName: string): string => {
    const timestamp = Date.now();
    const hash = createHash('sha256').update(originalName + timestamp).digest('hex').substring(0, 16);
    const extension = originalName.split('.').pop();
    return `${hash}_${timestamp}.${extension}`;
  },
  
  // Validate file security
  isSecureFile: (filename: string, mimeType: string): boolean => {
    const extension = filename.toLowerCase().split('.').pop();
    const isForbidden = FILE_VALIDATION.FORBIDDEN_PATTERNS.some(pattern => pattern.test(filename));
    const isAllowed = Object.values(FILE_VALIDATION.ALLOWED_EXTENSIONS)
      .flat()
      .some(ext => ext === `.${extension}`);
    
    return !isForbidden && isAllowed;
  },
  
  // Classification helper
  classifyData: (content: string, filename: string): keyof typeof DATA_CLASSIFICATION.SENSITIVITY_LEVELS => {
    const contentLower = content.toLowerCase();
    const filenameLower = filename.toLowerCase();
    
    for (const [pattern, classification] of Object.entries(DATA_CLASSIFICATION.AUTO_CLASSIFY_PATTERNS)) {
      if (contentLower.includes(pattern) || filenameLower.includes(pattern)) {
        return classification as keyof typeof DATA_CLASSIFICATION.SENSITIVITY_LEVELS;
      }
    }
    
    return 'INTERNAL'; // Default classification
  },
} as const;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type AccessLevel = keyof typeof ACCESS_CONTROL.ACCESS_LEVELS;
export type Permission = keyof typeof ACCESS_CONTROL.PERMISSIONS;
export type SensitivityLevel = keyof typeof DATA_CLASSIFICATION.SENSITIVITY_LEVELS;
export type ComplianceFramework = keyof typeof COMPLIANCE.FRAMEWORKS;
export type LogEvent = keyof typeof AUDIT_CONFIG.LOG_EVENTS;
export type LogLevel = keyof typeof AUDIT_CONFIG.LOG_LEVELS;

export interface SecurityContext {
  userId: string;
  permissions: Permission[];
  accessLevel: AccessLevel;
  complianceFramework?: ComplianceFramework;
  sessionId: string;
  ipAddress: string;
}

export interface FileSecurityMetadata {
  classification: SensitivityLevel;
  encrypted: boolean;
  accessLevel: AccessLevel;
  createdBy: string;
  lastAccessedBy: string;
  accessCount: number;
  complianceFlags: string[];
} 