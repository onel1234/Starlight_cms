import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logger implementation
class Logger {
  private logLevel: string;
  private logFile: string;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = process.env.LOG_FILE || 'logs/app.log';
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }

  private writeToFile(message: string): void {
    try {
      fs.appendFileSync(this.logFile, message + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      const formattedMessage = this.formatMessage('error', message);
      console.error(formattedMessage, ...args);
      this.writeToFile(formattedMessage);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      const formattedMessage = this.formatMessage('warn', message);
      console.warn(formattedMessage, ...args);
      this.writeToFile(formattedMessage);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      const formattedMessage = this.formatMessage('info', message);
      console.info(formattedMessage, ...args);
      this.writeToFile(formattedMessage);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      const formattedMessage = this.formatMessage('debug', message);
      console.debug(formattedMessage, ...args);
      this.writeToFile(formattedMessage);
    }
  }
}

export const logger = new Logger();