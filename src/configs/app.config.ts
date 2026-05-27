/**
 * Application Configuration
 * 
 * Centralized configuration management with environment variable validation
 * Secrets are loaded from secure vault (AWS Secrets Manager / Azure Key Vault)
 * 
 * @version 1.0.0
 */

import dotenv from 'dotenv';
import { z