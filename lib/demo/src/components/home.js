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
exports.HomeComponent = void 0;
const react_1 = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
function HomeComponent() {
    const [input, setInput] = react_1.useState('');
    const history = react_router_dom_1.useHistory();
    return <div className="container">
        <h2 className="mt-5">Create video stream</h2>
        <div className="form-group">
            <input className="form-control" name="link" placeholder="Torrent file or magnet link" value={input} onChange={event => {
        setInput(event.target.value);
    }}/>
        </div>
        <button className="btn btn-outline-primary" onClick={() => {
        if (input.trim()) {
            history.push(`/play?torrent=${encodeURIComponent(input)}`);
        }
    }}>Load video</button>
    </div>;
}
exports.HomeComponent = HomeComponent;
