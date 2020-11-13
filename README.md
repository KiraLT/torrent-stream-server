# Torrent Stream Server

[![Docker](https://github.com/KiraLT/torrent-stream-server/workflows/Docker/badge.svg?branch=master)](https://github.com/users/KiraLT/packages/container/package/torrent-stream-server)
[![CodeQL](https://github.com/KiraLT/torrent-stream-server/workflows/CodeQL/badge.svg?branch=master)](https://github.com/KiraLT/torrent-stream-server/actions?query=workflow%3ACodeQL)
[![Dependencies](https://david-dm.org/KiraLT/torrent-stream-server.svg)](https://david-dm.org/KiraLT/torrent-stream-server)
[![npm version](https://badge.fury.io/js/torrent-stream-server.svg)](https://www.npmjs.com/package/torrent-stream-server)

**Whats new:**

* Search & stream torrents - [preview](https://i.imgur.com/kSXYGrm.png)
* Stream any file from the torrent - [preview](https://i.imgur.com/qRmicai.png)
* Monitor activity - [preview](https://i.imgur.com/aPTcl9P.png)

HTTP server to convert any torrent to video stream

![Demo](https://i.imgur.com/mIzSYWV.png)

## Setup

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/KiraLT/torrent-stream-server)

### NPM package

* `npm install -g torrent-stream-server`
* `torrent-stream-server serve`
* Go to http://127.0.0.1:3000

[Read more](https://kiralt.github.io/torrent-stream-server/docs/setup.md#npm-package)
  
### Other options

* [From source](https://kiralt.github.io/torrent-stream-server/docs/setup.md#from-source)
* [Docker](https://kiralt.github.io/torrent-stream-server/docs/setup.md#docker)
* See [all options](https://kiralt.github.io/torrent-stream-server/docs/setup.md)

## Development

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/KiraLT/torrent-stream-server)

* [Development docs](https://kiralt.github.io/torrent-stream-server/docs/setup.md#from-source)
* [Configuration docs](https://kiralt.github.io/torrent-stream-server/docs/configuration.md)

## API

API uses [swagger.yaml](https://kiralt.github.io/torrent-stream-server/docs/swagger.html) to:

1. To generate API documentation page, which can be accesed when using `npm run dev` on http://127.0.0.1:3000/api-docs.
2. To generate frontend client (`frontend/src/helpers/client`)
3. To generate backend models (`src/models`)

> [Check documentation](https://kiralt.github.io/torrent-stream-server/docs/swagger.html)

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
