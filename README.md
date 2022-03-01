# Torrent Stream Server

[![Docker](https://github.com/KiraLT/torrent-stream-server/workflows/Docker/badge.svg?branch=master)](https://github.com/users/KiraLT/packages/container/package/torrent-stream-server)
[![CodeQL](https://github.com/KiraLT/torrent-stream-server/workflows/CodeQL/badge.svg?branch=master)](https://github.com/KiraLT/torrent-stream-server/actions?query=workflow%3ACodeQL)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

HTTP server to convert any torrent to stream with video support.

![Cover](https://github.com/KiraLT/torrent-stream-server/wiki/images/play-white.png)

**Features:**

* Create stream from magnet or torrent file - [preview](https://github.com/KiraLT/torrent-stream-server/wiki/images/home.png)
* Choose which file to stream - [preview](https://github.com/KiraLT/torrent-stream-server/wiki/images/files.png)
* Stream video files - [preview](https://github.com/KiraLT/torrent-stream-server/wiki/images/play.png)
* Search & stream torrents - [preview](https://github.com/KiraLT/torrent-stream-server/wiki/images/browse.png)
* Playlist support (m3u), open with external player - [preview](https://github.com/KiraLT/torrent-stream-server/wiki/images/playlist.png)
* Monitor activity - [preview](https://github.com/KiraLT/torrent-stream-server/wiki/images/dashboard.png)

## Setup

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/KiraLT/torrent-stream-server)
[![Develop on Okteto](https://okteto.com/develop-okteto.svg)](https://cloud.okteto.com/deploy?repository=https://github.com/KiraLT/torrent-stream-server&branch=master)

> _Heroku & Okteto forbids P2P services, so your account can be suspended ([learn more](https://github.com/KiraLT/torrent-stream-server/issues/32))_

### NPM package

[![Dependencies](https://david-dm.org/KiraLT/torrent-stream-server.svg)](https://david-dm.org/KiraLT/torrent-stream-server)
[![npm version](https://badge.fury.io/js/torrent-stream-server.svg)](https://www.npmjs.com/package/torrent-stream-server)
[![npm downloads](https://img.shields.io/npm/dt/torrent-stream-server)](https://www.npmjs.com/package/torrent-stream-server)

* `npm install -g torrent-stream-server`
* `torrent-stream-server serve`
* Go to http://127.0.0.1:3000

[Read more](https://github.com/KiraLT/torrent-stream-server/wiki/setup#npm-package)
  
### Other options

* [VPS](https://github.com/KiraLT/torrent-stream-server/wiki/setup#vps)
* [Docker](https://github.com/KiraLT/torrent-stream-server/wiki/setup#docker)
* [Kubernetes](https://github.com/KiraLT/torrent-stream-server/wiki/setup#kubernetes)
* See [all options](https://github.com/KiraLT/torrent-stream-server/wiki/setup)

## Documentation

* [Setup docs](https://github.com/KiraLT/torrent-stream-server/wiki/setup)
* [Configuration docs](https://github.com/KiraLT/torrent-stream-server/wiki/configuration)
* [Security docs](https://github.com/KiraLT/torrent-stream-server/wiki/security)
* [API docs](https://github.com/KiraLT/torrent-stream-server/wiki/API)
* [Development docs](https://github.com/KiraLT/torrent-stream-server/wiki/development)
* [Usage examples](https://github.com/KiraLT/torrent-stream-server/wiki/Examples)
