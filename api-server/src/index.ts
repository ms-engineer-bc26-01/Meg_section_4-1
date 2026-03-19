import 'dotenv/config';
import { createApp } from './app';
import { config } from './config/env';
import { logger } from './logger';

const app = createApp();

app.listen(config.port, () => {
  logger.info(`API server started`, {
    port: config.port,
    env: config.nodeEnv,
    logLevel: config.logLevel,
  });
});
