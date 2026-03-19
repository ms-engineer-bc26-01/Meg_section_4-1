FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# 開発サーバーで起動 (ホットリロード対応: 3-1 要件)
CMD ["node_modules/.bin/next", "dev", "-H", "0.0.0.0"]
