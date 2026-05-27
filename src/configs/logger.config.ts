/**
 * Logging Configuration
 * Winston logger with PII/PHI/PCI filtering and audit trail
 * 
 * Features:
 * - Multiple transports (Console, File, CloudWatch)
 * - PII/PHI/PCI data filtering
 * - Structured logging with correlation IDs
 * - Separate audit log for compliance
 * - Log rotation and retention
 * 
 * @version 1.0.0
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from './app.config';

// PII/PHI/PCI patterns to filter
const sensitivePatterns = [
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN