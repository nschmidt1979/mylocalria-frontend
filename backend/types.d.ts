// TypeScript type definitions for the backend API

import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken;
    }
  }
}

// ADV Part 2A Data Types
export interface AdvPart2AData {
  crd_number: string;
  rep_name: string;
  updatedAt?: any; // Firestore Timestamp
  updatedBy?: string;
  [key: string]: any; // Allow additional fields
}

// ADV Part 2B Data Types
export interface AdvPart2BData {
  crd_number: string;
  rep_name: string;
  updatedAt?: any; // Firestore Timestamp
  updatedBy?: string;
  [key: string]: any; // Allow additional fields
}

// Request Body Types
export interface UpsertAdvDataRequest {
  crd_number: string | number;
  rep_name: string;
  data?: Record<string, any>;
}

// Response Types
export interface SuccessResponse {
  success: true;
  message?: string;
  data?: any;
  crd_number?: string;
  count?: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  errors?: any[];
  stack?: string;
}

// Custom Error Types
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}