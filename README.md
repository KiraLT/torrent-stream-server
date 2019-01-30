# torrent-stream-server

HTTP server to convert any torrent to video stream

![Demo](https://i.imgur.com/twwkcOl.png)

## Demo

* `npm install`
* `npm run start`
* Go to http://127.0.0.1:3000

## Commands

* `npm run build` - build typescript to javascript
* `npm run start` - start HTTP server (javascript)

## API

### GET /

Demo page

### GET /torrents

List of active torrents

### GET /stream

URL GET params:

* `torrent` - magnet or torrent link
* `file` (optional) - file name to stream, by default takes first file

