import { appConfig } from './config';
import { logger } from './utils/logger';
import { connectToDatabase } from './db';
import { createApp } from './app';

const app = createApp();

async function start() {
  await connectToDatabase();
  app.listen(appConfig.port, () => {
    logger.info({ port: appConfig.port }, 'API listening');
  });
}

start().catch((err) => {
  logger.error({ err }, 'Fatal on startup');
  process.exit(1);
});


