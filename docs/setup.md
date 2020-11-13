# Setup

# Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/KiraLT/torrent-stream-server)

> _Heroku forbids P2P services, so your account can be suspened ([learn more](https://github.com/KiraLT/torrent-stream-server/issues/32))_

Deploy to Heroku with one click, works with free tier!

## NPM package

[![npm version](https://badge.fury.io/js/torrent-stream-server.svg)](https://www.npmjs.com/package/torrent-stream-server)

The npm module can be installed with npm or yarn on a local machine, depending on your preference.

```shell
npm install -g torrent-stream-server
```

Once installed, you can always run `torrent-stream-server --help` to see a list of available commands.

### Run server

```shell
torrent-stream-server serve
```
Go to http://127.0.0.1:3000

### Configuration

You can pass [configuration file](./configuration) with `-c` argument:

```shell
torrent-stream-server serve -c config.json
```

## NPX

You can run using [NPX](https://www.npmjs.com/package/npx):

```shell
npx torrent-stream-server serve
```

## From source

[![CodeQL](https://github.com/KiraLT/torrent-stream-server/workflows/CodeQL/badge.svg?branch=master)](https://github.com/KiraLT/torrent-stream-server)

```shell
git clone https://github.com/KiraLT/torrent-stream-server.git
npm install
npm run build
npm run start
```

Go to http://127.0.0.1:3000

## Docker

[![Docker](https://github.com/KiraLT/torrent-stream-server/workflows/Docker/badge.svg?branch=master)](https://github.com/users/KiraLT/packages/container/package/torrent-stream-server)

This will start a new instance with latest version listening on `3000` port (see [all versions](https://github.com/users/KiraLT/packages/container/torrent-stream-server/versions)). 

```shell
docker run -d --name torrent-stream-server ghcr.io/kiralt/torrent-stream-server:latest
```

### Custom port

If you'd like to be able to access the instance from the host without the container's IP, standard port mappings can be used:

```shell
docker run -d --name torrent-stream-server -p 80:3000 ghcr.io/kiralt/torrent-stream-server:latest
```

You'll be able to access it on http://localhost
