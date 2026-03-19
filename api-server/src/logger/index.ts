import winston from 'winston';
import { config } from '../config/env';

// Winston ロガー: LOG_LEVEL 環境変数でレベルを制御 (4-3-1 要件)
// レベル: error(0) < warn(1) < info(2) < http(3) < debug(4)
export const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
      return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

// Morgan がログ書き込みに使用するストリーム (http レベルで出力)
export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};
