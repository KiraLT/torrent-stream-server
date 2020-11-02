FROM node:12

WORKDIR /usr/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ src/
RUN npm run build

COPY frontend/package*.json frontend/
RUN npm ci --prefix frontend/
COPY frontend/tsconfig.json frontend/
COPY frontend/src/ frontend/src/
COPY frontend/public/ frontend/public/
RUN npm run --prefix ./frontend build

EXPOSE 3000
CMD node lib/index.js
