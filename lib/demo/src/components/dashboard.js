"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardComponent = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const timeago_js_1 = require("timeago.js");
const client_1 = require("../helpers/client");
const helpers_1 = require("../helpers");
function DashboardComponent() {
    const [torrents, setTorrents] = react_1.useState();
    const [usage, setUsage] = react_1.useState();
    const [error, setError] = react_1.useState('');
    const updateTorrents = () => {
        client_1.getTorrents().then(v => setTorrents(v)).catch(err => {
            setError(String(err));
        });
    };
    const updateUsage = () => {
        client_1.getUsage().then(v => setUsage(v)).catch(err => {
            setError(String(err));
        });
    };
    react_1.useEffect(() => {
        updateTorrents();
        updateUsage();
        const interval = setInterval(() => {
            updateTorrents();
        }, 5 * 1000);
        const usageInterval = setInterval(() => {
            updateTorrents();
        }, 5 * 1000);
        return () => {
            clearInterval(interval);
            clearInterval(usageInterval);
        };
    }, []);
    return <div className="container">
        {error && <div className="alert alert-danger" role="alert">
            {error}
        </div>}
        {!torrents && !error && <div className="text-center">
            <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>}
        {usage && <div className="card-deck mb-3 text-center">
            <div className="card mb-4 box-shadow">
                <div className="card-header">
                    <h4 className="my-0 font-weight-normal">Disk space</h4>
                </div>
                <div className="card-body">
                    <h2 className="card-title pricing-card-title">
                        {helpers_1.formatBytes(usage.totalDiskSpace - usage.freeDiskSpace)}
                        <small className="text-muted">/ {helpers_1.formatBytes(usage.totalDiskSpace)}</small>
                    </h2>
                    <div className="progress">
                        <div className="progress-bar" role="progressbar" style={{
        width: `${((usage.totalDiskSpace - usage.freeDiskSpace) / usage.totalDiskSpace * 100)}%`
    }}></div>
                    </div>
                </div>
            </div>
            <div className="card mb-4 box-shadow">
                <div className="card-header">
                    <h4 className="my-0 font-weight-normal">Torrents space</h4>
                </div>
                <div className="card-body">
                    <h2 className="card-title pricing-card-title">
                        {helpers_1.formatBytes(usage.usedTorrentSpace)}
                        <small className="text-muted">/ {helpers_1.formatBytes(usage.freeDiskSpace + usage.usedTorrentSpace)}</small>
                    </h2>
                    <div className="progress">
                        <div className="progress-bar" role="progressbar" style={{
        width: `${usage.usedTorrentSpace / (usage.freeDiskSpace + usage.usedTorrentSpace) * 100}%`
    }}></div>
                    </div>
                </div>
            </div>
        </div>}
        {torrents && <>
            {torrents.length ? <>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Download</th>
                            <th>Created</th>
                            <th>Play</th>
                        </tr>
                    </thead>
                    <tbody>
                        {torrents.map(torrent => <>
                            <tr>
                                <td>{torrent.name}</td>
                                <td>{helpers_1.formatBytes(torrent.downloaded)} ({helpers_1.formatBytes(torrent.downloadSpeed)}/s)</td>
                                <td>{timeago_js_1.format(torrent.started)}</td>
                                <td><react_router_dom_1.Link to={`/play?torrent=${torrent.link}`} className="btn btn-outline-primary ti-control-play"></react_router_dom_1.Link></td>
                            </tr>
                        </>)}
                    </tbody>
                </table>
            </> : <div className="alert alert-warning" role="alert">
                No active torrents at the moment
            </div>}
        </>}
    </div>;
}
exports.DashboardComponent = DashboardComponent;
