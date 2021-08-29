# Configuration

## File

You can pass JSON config file to any run command with `-c` option (e.g. `npm run start -c config.json`).

All config parameters are optional, so you add only necessary parameters to your configurations.

```javascript
{
    /**
     * Server host.
     *
     * Default:  `0.0.0.0`
     */
    "host": "0.0.0.0"
    /**
     * Server port.
     *
     * Default:  3000
     */
    "port": 3000,
    /**
     * Project environment- `development` or `production'`
     *
     * Default:  `production`
     */
    "environment": "production",
    /**
     * Logging configuration.
     */
    "logging": {
        /**
        * Logging transports.
        *
        * Default: `console`
        */
        "transports": [
            {
                "type": "console"
            },
            {
                /**
                * Enables https://loggly.com logging
                */
                "type": "loggly",
                /**
                * Loggly subdomain
                */
                "subdomain": "my-loggly-subdomain",
                /**
                * Loggly token
                */
                "token": "my token",
                /**
                * Loggly tags, can be used to filter logs
                */
                "tags": ["torrent-stream-server"]
            }
        ],
        /**
         * Logging level, one of `debug`, `info`, `warn`, `error`.
         *
         * Default:  `info`
         */
        "level": "info"
    },
    /**
     * Torrent client settings
     */
    "torrents": {
        /**
        * Where to store downloaded torrents
        * Default: `/tmp/torrent-stream-server`
        */
        "path": "/tmp/torrent-stream-server",
        /**
         * Delete torrent data if it is inactive for X seconds.
         *
         * Default:  `3600`
         */
        "ttl": 3600,
        /**
         * Load default trackers list & use it for each torrents.
         *
         * Default:  `true`
         */
        "useDefaultTrackers": true,
        /**
         * Additional trackers (`tr` parameter) which will be appended to each torrent.
         *
         * Default:  []
         */
        "announce": [],
        /**
         * Web Seed (`ws` parameter) which will be appended to each torrent.
         *
         * Default:  []
         */
        "urlList": [],
        /**
         * Peer addresses (`x.pe` parameter).
         *
         * Default:  []
         */
        "peerAddresses": [],
        /**
         * Max download speed (bytes/sec) over all torrents
         * 
         * Default: `5242880`
         */
        "downloadLimit": 5242880,
        /**
         * Max upload speed (bytes/sec) over all torrents
         * 
         * Default: `0`
         */
        "uploadLimit": 0,
    },
    /**
     * Security settings
     */
    "security": {
        /**
         * Stream API (`/stream/:torrent`) settings
         */
        "streamApi": {
            /**
             * Protect stream API with JSON Web Token (check https://jwt.io).
             *
             * If `apiKey` is not set, it can also be used as API key (`authorization`: `bearer ${apiKey}`).
             *
             * Default:  undefined
             */
            "key": "my random key",
            /**
             * The maximum allowed age for tokens to still be valid.
             * It is expressed in seconds or a string describing a time span (check https://github.com/vercel/ms)
             *
             * Default:  `6h`
             */
            "maxAge": "6h"
        },
        /**
         * Serve frontend static files
         *
         * Default: true if production environment
         */
        "frontendEnabled": true,
        /**
         * Enable API
         *
         * Default:  true
         */
        "apiEnabled": true,
        /**
         * Protect API with key. It should be passed to headers to access the API (`authorization`: `bearer ${apiKey}`).
         *
         * If `streamApi` doesn't have a separate key, `apiKey` can be used as JSON Web Token.
         *
         * Default:  undefined
         */
        "apiKey": "my random key",
        /**
         * Limit requests per minute for single IP
         * 
         * Default: 100
         */
        "rpm": 100
    }),
    },
    /**
     * Get ip from `X-Forwarded-*` header.
     *
     * Default:  true if inside App Engine or Heroku else false
     */
    "trustProxy": true
}
```

## ENV variables

You can specify any parameter from config by passing ENV variable with `config` prefix (separate different levels with `__`).

You can also pass JSON values for these ENV variables. Keys are automatically converted to camelCase.

### Examples:

* `CONFIG='{"port": 80}'` - overwrite port by passing JSON config
* `CONFIG__PORT='80'` - overwrite port by providing exact parameter name.
* `CONFIG__LOGGING__TRANSPORTS='[{"type": "loggly", "subdomain": "loggly-subdomain", "token": "my token"}]'`

### Shortcuts:

Some config parameters have ENV variable shortcuts:

* `HOST` - set config `host` parameter.
* `PORT` - set config `port` parameter.
* `API_KEY` - set config `security.apiKey` parameter.
* `NODE_ENV` - set config `environment` parameter.
* `TRUST_PROXY` - set config `trustProxy` parameter.
