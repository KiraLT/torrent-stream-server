FROM node:12

WORKDIR /usr/app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src/ src/
RUN npm run build-backend

COPY frontend/package*.json frontend/
RUN npm ci --prefix frontend/
COPY frontend/tsconfig.json frontend/
COPY frontend/src/ frontend/src/
COPY frontend/public/ frontend/public/
RUN npm run build-frontend && rm -rf ./frontend/node_modules

EXPOSE 3000
CMD node lib/index.js
