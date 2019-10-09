FROM node:10
WORKDIR /usr/app
COPY package*.json ./
RUN npm ci --only=production
COPY config.json lib ./
EXPOSE 3000
CMD node lib/index.js config.json
