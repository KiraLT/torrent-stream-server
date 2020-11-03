# torrent-stream-server

HTTP server to convert any torrent to video stream

![Demo](https://i.imgur.com/mIzSYWV.png)

## Demo

* `npm install`
* `npm run start`
* Go to http://127.0.0.1:3000

> This will run prebuild server

**Whats new:**

* Search & stream torrents - [preview](https://i.imgur.com/kSXYGrm.png)
* Stream any file from the torrent - [preview](https://i.imgur.com/qRmicai.png)
* Monitor activity - [preview](https://i.imgur.com/aPTcl9P.png)

## Development

_Run backend dev server_

* `npm run dev` - it will run TypeScript server with live reload.

> Please notice that it will use the prebuilt frontend already present in the repo. If you wish to change frontend, check [frontend readme](frontend/README.md)

_Build backend_

* `npm run build` - it will compile TypeScript code to JavaScript, required for `npm run start`.

> Please notice that it will not build frontend. If you wish to build frontend, check [frontend readme](frontend/README.md)

## Production

`npm run start` - run prebuilt JS backend which includes prebuilt frontend

## Commands

* `npm run build` - build TypeScript to JavaScript
* `npm run start` - start HTTP server (JavaScript)
* `npm run dev` - start HTTP server from source with live reload

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
