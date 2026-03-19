// Express API サーバーのベース URL
// NEXT_PUBLIC_ プレフィックスにより、ブラウザのバンドルにも含まれる
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const apiUrl = (path: string): string => `${API_BASE_URL}${path}`;
