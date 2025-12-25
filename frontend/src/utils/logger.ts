/**
 * Simple logger utility for more structured frontend logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
    private static formatMessage(level: LogLevel, message: string, data?: any) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
        return { prefix, message, data };
    }

    static debug(message: string, data?: any) {
        // Only log debug in development
        if (__DEV__) {
            const { prefix, message: msg, data: d } = this.formatMessage('debug', message, data);
            console.debug(prefix, msg, d || '');
        }
    }

    static info(message: string, data?: any) {
        const { prefix, message: msg, data: d } = this.formatMessage('info', message, data);
        console.info(prefix, msg, d || '');
    }

    static warn(message: string, data?: any) {
        const { prefix, message: msg, data: d } = this.formatMessage('warn', message, data);
        console.warn(prefix, msg, d || '');
    }

    static error(message: string, error?: any) {
        const { prefix, message: msg, data: d } = this.formatMessage('error', message, error);
        console.error(prefix, msg, d || '');
    }
}

export default Logger;
