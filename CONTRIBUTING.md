# Contributing

## Development Setup

### Structure

The project consists of two node packages:

1. Root level [ExpressJs](https://expressjs.com/) app. It exposes API and controllers torrents. When in the production, it will also server [React](https://reactjs.org/) files from the build directory.
2. In the `frontend` directory [React](https://reactjs.org/) UI website.

### Typescript

Both `frontend` and `backend` uses [TypeScript](https://www.typescriptlang.org/) language. To run [TypeScript](https://www.typescriptlang.org/) in the production, you will need to build it to JavaScript with `npm run build` command - it will build `frontend` and `backend`.

### Openapi

Project uses [OpenApi](https://swagger.io/specification/) config file to. It's used to automatically validate all API endpoins, generate typescript types and generate frontend API client.

To add or edit API endpoints, edit `openapi.yaml` file and then build necessary files with `npm run build-openapi` command.

### GitPod

One-click ready-to-code development environments online:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/KiraLT/torrent-stream-server)

### Local dev server with live-reload

Because there are two packages, you will need to run two development servers. Ir you can use `dev` command to run both at the same time:

* `npm run dev` - starts both backend and frontend development servers
* `npm run dev-backend` - start dev server on `3000` port
* `npm run dev-frontend` - start dev server on  `3001` port

## Git Commit Guidelines

The semver level that should be bumped on a release is determined by the commit messages since the last release. In order to be able to decide the correct version and generate the changelog, the content of those commit messages must be parsed. It uses a parser for the [Angular commit message style](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits):

```
<type>: <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

> The body or footer can begin with BREAKING CHANGE: followed by a short description to create a major release.

### Type

Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing or correcting existing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation generation

### Subject

The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body

Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.


#### Footer

The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that this commit closes.

Breaking Changes should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.
