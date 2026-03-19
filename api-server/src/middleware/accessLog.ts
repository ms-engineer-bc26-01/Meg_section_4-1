import morgan from 'morgan';
import { morganStream } from '../logger';

// アクセスログ: combined フォーマット (IP, method, URL, status, response-time)
// LOG_LEVEL=http 以上で出力される (4-3-1 要件)
export const accessLog = morgan('combined', { stream: morganStream });
