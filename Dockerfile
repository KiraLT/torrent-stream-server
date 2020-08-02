FROM node:12
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD node lib/index.js config.json


docker build -t docker.pkg.github.com/kiralt/torrent-stream-server/torrent-stream-server:1.1.0 .