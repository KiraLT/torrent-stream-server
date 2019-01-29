# torrent-stream-server

HTTP server to convert any torrent to video stream

## Usage

* `npm run build` - build typescript to javascript
* `npm run start` - start HTTP server (javascript)

## API

### GET /torrents

### GET /stream

URL GET params:

* `torrent` - magnet or torrent link
* `file` (optional) - file name to stream, by default takes first file

