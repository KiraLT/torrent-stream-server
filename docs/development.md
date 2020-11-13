# Development

## GitPod

One-click ready-to-code development environments:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/KiraLT/torrent-stream-server)

## Using Docker & Docker Compose
Docker and Docker Compose required. NodeJS **not** required on development host.

* Edit `docker-compose.yml` to tailor to your needs (make sure `build: .` is uncommented).
* Run `docker-compose up --build [--force-recreate]`.

## From Source

> Frontend & backend are separate packages.

So during developemnt you will need to run two dev servers with live reload:

* `npm run dev-backend` - start dev server on `3000` port
* `npm run dev-frontend` - start dev server on  `3001` port

## Commands

* `npm install` - will install both: `frontend` & `backend`
* `npm run build` - will build backend to `lib` directory & frontend to `frontend/build`
* `npm run start` - start HTTP server with frontend support
* `npm run dev-backend` - start `backend` server with live reload on `3000` port
* `npm run dev-frontend` - start `frontend` server with live reload on `3001` port
