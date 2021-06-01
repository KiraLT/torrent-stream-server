# Torrent Stream Server

[![Docker](https://github.com/KiraLT/torrent-stream-server/workflows/Docker/badge.svg?branch=master)](https://github.com/users/KiraLT/packages/container/package/torrent-stream-server)
[![CodeQL](https://github.com/KiraLT/torrent-stream-server/workflows/CodeQL/badge.svg?branch=master)](https://github.com/KiraLT/torrent-stream-server/actions?query=workflow%3ACodeQL)
[![Dependencies](https://david-dm.org/KiraLT/torrent-stream-server.svg)](https://david-dm.org/KiraLT/torrent-stream-server)
[![npm version](https://badge.fury.io/js/torrent-stream-server.svg)](https://www.npmjs.com/package/torrent-stream-server)

HTTP server to convert any torrent to stream with video support.

![Cover](https://github.com/KiraLT/torrent-stream-server/raw/master/docs/images/play-white.png)

**Features:**

* Create stream from magnet or torrent file - [preview](https://github.com/KiraLT/torrent-stream-server/raw/master/docs/images/home.png)
* Choose which file to stream - [preview](https://github.com/KiraLT/torrent-stream-server/raw/master/docs/images/files.png)
* Stream video files - [preview](https://github.com/KiraLT/torrent-stream-server/raw/master/docs/images/play.png)
* Search & stream torrents - [preview](https://github.com/KiraLT/torrent-stream-server/raw/master/docs/images/browse.png)
* Playlist support (m3u), open with external player - [preview](https://github.com/KiraLT/torrent-stream-server/raw/master/docs/images/playlist.png)
* Monitor activity - [preview](https://github.com/KiraLT/torrent-stream-server/raw/master/docs/images/dashboard.png)

## Setup

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/KiraLT/torrent-stream-server)

> _Heroku forbids P2P services, so your account can be suspened ([learn more](https://github.com/KiraLT/torrent-stream-server/issues/32))_

### NPM package

* `npm install -g torrent-stream-server`
* `torrent-stream-server serve`
* Go to http://127.0.0.1:3000

[Read more](https://kiralt.github.io/torrent-stream-server/docs/setup#npm-package)
  
### Other options

* [From source](https://kiralt.github.io/torrent-stream-server/docs/setup#from-source)
* [Docker](https://kiralt.github.io/torrent-stream-server/docs/setup#docker)
* See [all options](https://kiralt.github.io/torrent-stream-server/docs/setup)

## Documentation

* [Setup docs](https://kiralt.github.io/torrent-stream-server/docs/setup)
* [Development docs](https://kiralt.github.io/torrent-stream-server/docs/development)
* [Configuration docs](https://kiralt.github.io/torrent-stream-server/docs/configuration)

## API

API uses [openapi.yaml](https://kiralt.github.io/torrent-stream-server/docs/openapi.html) to:

1. To generate API documentation page, which can be accesed when using `npm run dev` on http://127.0.0.1:3000/api-docs.
2. To generate frontend client (`frontend/src/helpers/client`)
3. To generate backend models (`src/models`)

> [Check documentation](https://kiralt.github.io/torrent-stream-server/docs/openapi.html)

## Examples

### Open in VLC

Running the following commands from a shell will run VLC and start playing the Sintel movie stream from its public torrent:

#### By infohash (BTIH)

``` bash
vlc "http://localhost:3000/stream/08ada5a7a6183aae1e09d831df6748d566095a10"
```
#### By magnet URI
``` bash
vlc "http://localhost:3000/stream?torrent=magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&file=Sintel.mp4"
```

### Download file using curl

This command will download Sintel movie from torrents and save as `sintel.mp4`.

``` bash
curl "http://localhost:3000/stream/08ada5a7a6183aae1e09d831df6748d566095a10" > sintel.mp4
```

## Security

API can be protected with `security.apiKey`, stream api can have additional [JSON Web Token](https://jwt.io/) (configurable via `security.streamApi.key`).

If only only one key specified in the config, it will be used as both: `API key` & `streamApi.key`.

### API protection

When api or stream key is enabled, each API call will require `Authorization` header:

```js
Authorization: Bearer <token>
```

### Generate stream API URL

```js
import { sign } from 'jsonwebtoken'

const url = `/stream/${encodeURIComponent(
    sign(
        {
            torrent: '08ada5a7a6183aae1e09d831df6748d566095a10',
            fileType: 'video',
        },
        key
    )
)}`
```

This API will have encoded parameters, so it's safe to share it publicly. It will automatically expire (configurable via `security.streamApi.maxAge`)
