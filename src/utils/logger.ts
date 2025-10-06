import { Logger } from '../types';

// Simple logger utility
const logger: Logger = {
  info: (message: string, meta: Record<string, any> = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, meta);
  },
  
  error: (message: string, meta: Record<string, any> = {}) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, meta);
  },
  
  warn: (message: string, meta: Record<string, any> = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, meta);
  }
};

export default logger;
