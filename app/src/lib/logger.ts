type LogLevel = 'info' | 'warn' | 'error';

const log = (level: LogLevel, msg: string, data?: unknown) => {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  if (level === 'error') console.error(prefix, msg, data ?? '');
  else if (level === 'warn') console.warn(prefix, msg, data ?? '');
  else console.log(prefix, msg, data ?? '');
};

export const logger = {
  info: (msg: string, data?: unknown) => log('info', msg, data),
  warn: (msg: string, data?: unknown) => log('warn', msg, data),
  error: (msg: string, err?: unknown) => log('error', msg, err),
};
