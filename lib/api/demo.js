"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setupDemoPage(app, config, logger) {
    app.get('/', (req, res) => res.send(`
        <!DOCTYPE html>
        <html>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
        <body class="d-flex flex-column h-100">
            <main class="flex-shrink-0">
                <div class="container">
                    <h1 class="mt-5">Torrent stream server</h1>
                    <p>Find more on <a href="https://github.com/KiraLT/torrent-stream-server" target="_blank">GitHub</a></p>
                    <h2 class="mt-5">Create video stream</h2>
                    <form>
                        <div>
                            <div class="form-group">
                                <input class="form-control" name="link" placeholder="Torrent file or magnet link">
                            </div>
                            <button type="submit" class="btn btn-primary">Load video</button>
                        </div>
                        ${req.query.link ? `
                            <br />
                            <br />
                            <div class="embed-responsive embed-responsive-16by9">
                                <video width="720" controls>
                                    <source src="/stream?torrent=${encodeURIComponent(req.query.link)}" type="video/mp4">
                                    Your browser does not support HTML5 video.
                                </video>
                            </div>
                            <br />
                            <div class="form-group">
                                <input class="form-control" value="${req.protocol}://${req.hostname}/stream?torrent=${encodeURIComponent(req.query.link)}">
                            </div>
                        ` : ''}
                    </form>
                </div>
            </main>
        </body>
    `));
    return app;
}
exports.setupDemoPage = setupDemoPage;
