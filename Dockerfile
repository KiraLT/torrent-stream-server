FROM node:12

WORKDIR /usr/app/
COPY package*.json ./
RUN npm ci --only=production

WORKDIR /usr/app/demo/
COPY demo/package*.json ./
RUN npm install

WORKDIR /usr/app/
COPY . .

RUN \
  cd ./demo/ && \
  yarn build

EXPOSE 3000
CMD node lib/index.js config.json
