import mongoose from 'mongoose';
import { appConfig } from './config';
import { logger } from './utils/logger';

export async function connectToDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(appConfig.mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });
    logger.info({ event: 'mongodb_connected' }, 'Connected to MongoDB');
  } catch (err) {
    logger.error({ err, event: 'mongodb_connection_error' }, 'Failed to connect to MongoDB');
  }
}

export function getDbReadyState(): number {
  return mongoose.connection.readyState; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
}


