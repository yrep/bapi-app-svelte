import fs from 'fs';
import path from 'path';

class ApiLogger {
  constructor() {
    this.enabled = true;
    this.logFile = path.join(process.cwd(), 'logs', 'api-requests.log');
    this.ensureLogDirectory();
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, '=== API Requests Log ===\n\n');
    }
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  formatTime() {
    return new Date().toISOString();
  }

  formatHeaders(headers) {
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  formatBody(body) {
    if (!body) return '';
    try {
      if (typeof body === 'string') {
        return JSON.stringify(JSON.parse(body), null, 2);
      }
      return JSON.stringify(body, null, 2);
    } catch {
      return String(body);
    }
  }

  writeToLog(message) {
    if (!this.enabled) return;
    try {
      fs.appendFileSync(this.logFile, message + '\n\n' + '='.repeat(80) + '\n\n');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  logRequest(source, method, url, body = null, headers = {}) {
    const logMessage = `
[${this.formatTime()}]
[${source}] ${method} ${url}
${body ? `Request Body:\n${this.formatBody(body)}` : 'No Body'}
Headers:
${this.formatHeaders(headers)}
    `.trim();
    this.writeToLog(logMessage);
  }

  logResponse(source, method, url, status, statusText, body = null, headers = {}) {
    const logMessage = `
[${this.formatTime()}]
[${source}] RESPONSE
${method} ${url}
${status} ${statusText}
${body ? `Response Body:\n${this.formatBody(body)}` : 'No Body'}
Response Headers:
${this.formatHeaders(headers)}
    `.trim();
    this.writeToLog(logMessage);
  }
}

export const apiLogger = new ApiLogger();