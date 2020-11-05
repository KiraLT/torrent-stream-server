# Torrent Stream Server

![Docker](https://github.com/KiraLT/torrent-stream-server/workflows/Docker/badge.svg?branch=master)
![CodeQL](https://github.com/KiraLT/torrent-stream-server/workflows/CodeQL/badge.svg?branch=master)
![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/KiraLT/torrent-stream-server)

HTTP server to convert any torrent to video stream

![Demo](https://i.imgur.com/mIzSYWV.png)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/KiraLT/torrent-stream-server)

## Installation

* `npm install`
* `npm build`
* `npm run start`
* Go to http://127.0.0.1:3000

> This will run prebuild server

**Whats new:**

* Search & stream torrents - [preview](https://i.imgur.com/kSXYGrm.png)
* Stream any file from the torrent - [preview](https://i.imgur.com/qRmicai.png)
* Monitor activity - [preview](https://i.imgur.com/aPTcl9P.png)

## Development

> Frontend & backend are separate packages.

So during developemnt you will need to run two dev servers with live reload:

* `npm run dev-backend` - start dev server on `3000` port
* `npm run dev-frontend` - start dev server on  `3001` port

## Commands

* `npm install` - will install both: frontend & backend
* `npm run build` - will build backend to `lib` directory & frontend to `frontend/build`
* `npm run start` - start HTTP server with frontend support
* `npm run dev-backend` - start `backend` server with live reload on `3000` port
* `npm run dev-frontend` - start `frontend` server with live reload on `3001` port

## Configuration

### ENV variables

_Check bellow for descriptions_

* `PORT`
* `HOST`
* `TRUST_PROXY`

> Configuration file can overwrite ENV variables

### File

You can pass JSON config file to any run command (e.g. `npm run start config.json`)

Available parameters:

* **host** - server host. Default is `process.env.HOST` or `0.0.0.0`
* **port** - server port. Default `process.env.PORT` or 3000.
* **trustProxy** - get ip from `X-Forwarded-*` header, [check more](https://expressjs.com/en/guide/behind-proxies.html), Default is `true` if running inside App Engine or Heroku else `false`
* **logging**
  * **level** - debug, info, warn or error. Default info.
  * **transports** - `{"type": "console"}` or `{"type": "loggly","subdomain": "my-subdomain","token": "abc","tags":["my-tag"]}`. Default `console`.
* **torrents**
  * **path** - torrents storage path. Default `/tmp/torrent-stream-server`.
  * **autocleanInternal** - how many seconds downloaded from last stream torrent is kept before deleting. Default is 1 hour. 
* **security**
  * **streamApi** - API is disabled when using this option unless `apiKey` is set.
    * **key** - JWT token.
    * **maxAge** - the maximum allowed age for tokens to still be valid.
  * **frontendEnabled** - enable demo page. Default is `true`.
  * **apiKey** - key which should be passed to headers to access the API (`authorization: bearer ${apiKey}`).

## API

API uses [swagger.yaml](https://kiralt.github.io/torrent-stream-server/src/swagger.html) to:

1. To generate API documentation page, which can be accesed when using `npm run dev` on http://127.0.0.1:3000/api-docs.
2. To generate frontend client (`frontend/src/helpers/client`)
3. To generate backend models (`src/models`)

> [Check documentation](https://kiralt.github.io/torrent-stream-server/src/swagger.html)

### Example
Running the following command from a shell will run VLC and start playing the Sintel movie stream from its public torrent:
```
$ vlc "http://localhost:3000/stream?torrent=magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&file=Sintel.mp4"
```

## JWT tokens

You can protect stream API with [JWT token](https://jwt.io/).

### Add key to config:

```json
{
    "secury": {
        "streamApi": {
            "key": "secret key",
            "maxAge": "5h"
        }
    }
}
```

### Create signed key:

#### Headers

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### Payload

```json
{
   "iat": 1554577257,
   "torrent": "magnet:?xt=urn:btih:4GOZACR2HENLSNHA7K6GSOFSTDWGOENJ&tr=http://nyaa.tracker.wf:7777/announce&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.internetwarriors.net:1337/announce&tr=udp://tracker.leechersparadise.org:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://open.stealth.si:80/announce&tr=udp://p4p.arenabg.com:1337/announce&tr=udp://mgtracker.org:6969/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=udp://peerfect.org:6969/announce&tr=http://share.camoe.cn:8080/announce&tr=http://t.nyaatracker.com:80/announce&tr=https://open.kickasstracker.com:443/announce"
}
```

* `iat` - unix timestamp, which indicates when was the key generated
* `torrent` - torrent magent link 

#### Signature

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "ENTER KEY HERE"
)
```

#### Use generated token

http://127.0.0.1:3000/stream?token=JWT_TOKEN
