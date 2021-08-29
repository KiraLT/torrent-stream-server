FROM node:12

WORKDIR /usr/app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY frontend/package*.json frontend/
RUN npm ci --prefix frontend/

COPY tsconfig.json openapi.yaml ./
COPY src/ src/
COPY spec/ spec/
RUN npm run build-backend
RUN npm run test

COPY frontend/tsconfig.json frontend/
COPY frontend/src/ frontend/src/
COPY frontend/public/ frontend/public/
RUN npm run build-frontend && rm -rf ./frontend/node_modules

EXPOSE 3000
ENTRYPOINT [ "node", ".", "serve" ]
