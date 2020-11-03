"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuthApi = void 0;
function setupAuthApi(app, config, _logger, _client) {
    app.post('/api/auth', async (_req, res) => {
        res.json({
            success: true,
        });
    });
    return app;
}
exports.setupAuthApi = setupAuthApi;
