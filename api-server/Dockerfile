FROM node:20-alpine

# Prisma が必要とする OpenSSL をインストール
RUN apk add --no-cache openssl

WORKDIR /app

# 依存関係をインストール
COPY package*.json ./
RUN npm install

# Prisma スキーマをコピーしてクライアント生成
COPY prisma ./prisma
RUN npx prisma generate

# ソースコードをコピー
COPY . .

# アプリケーションポート
EXPOSE 3001

# Node.js デバッガポート (4-3-2 要件: コンテナ内デバッグ)
EXPOSE 9229

# 開発環境: ts-node-dev でホットリロード + Inspector
CMD ["node", "--inspect=0.0.0.0:9229", "node_modules/.bin/ts-node-dev", "--respawn", "--transpile-only", "src/index.ts"]
