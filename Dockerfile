FROM node:12

WORKDIR /usr/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json .
COPY src/ src/
RUN npm run build

WORKDIR /usr/app/frontend
COPY package*.json ./
RUN npm ci
COPY tsconfig.json .
COPY src/ src/
COPY public/ public/
RUN npm run build

WORKDIR /usr/app
EXPOSE 3000
CMD node lib/index.js
