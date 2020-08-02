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
exports.PlayComponent = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const client_1 = require("../helpers/client");
const helpers_1 = require("../helpers");
function PlayComponent() {
    const [torrent, setTorrent] = react_1.useState();
    const [error, setError] = react_1.useState('');
    const location = react_router_dom_1.useLocation();
    const searchParams = new URLSearchParams(location.search);
    const link = searchParams.get('torrent');
    const file = searchParams.get('file');
    react_1.useEffect(() => {
        const action = async () => {
            if (link) {
                setTorrent(await client_1.createTorrent({ link }));
            }
            else {
                setError('Torrent link is not specified');
            }
        };
        action().catch(err => {
            setError(String(err));
        });
    }, [link]);
    return <div className="container">
        {error && <div className="alert alert-danger" role="alert">
            {error}
        </div>}
        {!torrent && !error && <div className="text-center">
            <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>}
        {torrent && <>
            <h3><small>{torrent.name}</small></h3>
            {!file ? <table className="table">
                <thead>
                    <tr>
                        <th>File</th>
                        <th>Size</th>
                        <th>Play</th>
                    </tr>
                </thead>
                <tbody>
                    {helpers_1.sortBy(torrent.files, v => v.name).map(v => <tr>
                        <td>
                            {v.path.split('/').map((part, index, arr) => index + 1 < arr.length ? <span className='text-muted'>{part} / </span> : part)}
                        </td>
                        <td>
                            {helpers_1.formatBytes(v.length)}
                        </td>
                        <td>
                            <react_router_dom_1.Link to={`?torrent=${link}&file=${encodeURIComponent(v.path)}`} className="btn btn-outline-primary ti-control-play"></react_router_dom_1.Link>
                        </td>
                    </tr>)}
                </tbody>
            </table> : <>
                <h5 className="text-muted"><small>{file}</small> - <react_router_dom_1.Link to={`?torrent=${link}`}>view all</react_router_dom_1.Link></h5>
            </>}
            {file && link && <>
                <div className="embed-responsive embed-responsive-16by9">
                    <video width="720" controls>
                        <source src={client_1.getSteamUrl(link, file)} type="video/mp4"/>
                        Your browser does not support HTML5 video.
                    </video>
                </div>
                <br />
                <div className="form-group">
                    <input className="form-control" value={client_1.getSteamUrl(link, file)}/>
                </div>
            </>}
        </>}
    </div>;
}
exports.PlayComponent = PlayComponent;
