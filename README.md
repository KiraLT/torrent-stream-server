# torrent-stream-server

HTTP server to convert any torrent to video stream

![Demo](https://i.imgur.com/mIzSYWV.png)

## Demo

* `npm install`
* `npm run start`
* Go to http://127.0.0.1:3000

> This will run prebuild server

**Whats new:**

* Stream any file from the torrent - [preview](https://i.imgur.com/qRmicai.png)
* Monitor activity - [preview](https://i.imgur.com/aPTcl9P.png)

## Commands

* `npm run build` - build typescript to javascript
* `npm run start` - start HTTP server (javascript)
* `npm run dev` - start HTTP server from source with live reload

## Configuration

You can pass json config file to any run command (`e.g. npm run start config.json`)

Available parameters:
* **port** - server port. Default `process.env.PORT` or 3000.
* **logging**
  * **level** - debug, info, warn or error. Default info.
  * **transports** - `{"type": "console"}` or `{"type": "loggly","subdomain": "my-subdomain","token": "abc","tags":["my-anime-stream]}`. Default `console`.
* **torrents**
  * **path** - torrents storage path. Default `/tmp/torrent-stream-server`.
  * **autocleanInternal** - how many seconds downloaded from last stream torrent is kept before deleting. Default is 1 hour. 
* **security**
  * **streamApi** - API is disabled when using this option unless `apiKey` is set.
    * **key** - JWT token.
    * **maxAge** - the maximum allowed age for tokens to still be valid.
  * **demoEnabled** - enable demo page. Default is `true`.
  * **apiKey** - key which should be passed to headers to access the API (`authorization: bearer ${apiKey}`).

## API

### GET /api/torrents

```ts
type Response = Array<{
    link: string
    infoHash: string
    name: string
    started: number
    updated: number
    files: {
        name: string
        path: string
        length: number
    }[]
    downloaded: number
    downloadSpeed: number
}>
```


### POST /api/torrents?link={magnetOrUrl}

```ts
type Response = {
    link: string
    infoHash: string
    name: string
    started: number
    updated: number
    files: {
        name: string
        path: string
        length: number
    }[]
    downloaded: number
    downloadSpeed: number
}
```

### GET /api/torrents/{infoHash}

```ts
type Response = {
    link: string
    infoHash: string
    name: string
    started: number
    updated: number
    files: {
        name: string
        path: string
        length: number
    }[]
    downloaded: number
    downloadSpeed: number
}
```

### GET /api/usage

```ts
type Response = {
  totalDiskSpace: number,
  freeDiskSpace: number,
  usedTorrentSpace: number,
}
```

### GET /stream

URL GET params:

* `torrent` - magnet or torrent link
* `file` (optional) - file name to stream, by default takes first file

Or:

* `token` - JWT token with above parameters as payload


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
