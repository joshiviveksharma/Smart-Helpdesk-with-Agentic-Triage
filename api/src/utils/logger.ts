import pino from 'pino';
import { appConfig } from '../config';

const isDev = appConfig.nodeEnv !== 'production';

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
    remove: true
  },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined
});


