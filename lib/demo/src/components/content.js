"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentComponent = void 0;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const react_router_1 = require("react-router");
const home_1 = require("./home");
const play_1 = require("./play");
const dashboard_1 = require("./dashboard");
function ContentComponent() {
    return <div>
            <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom box-shadow">
            <h5 className="my-0 mr-md-auto font-weight-normal"><react_router_dom_1.Link className='text-decoration-none text-dark' to='/'>Torrent Stream Server</react_router_dom_1.Link></h5>
            <nav className="my-2 my-md-0 mr-md-3">
                <react_router_dom_1.Link className="p-2 text-dark" to="/">Home</react_router_dom_1.Link>
                <react_router_dom_1.Link className="p-2 text-dark" to="/dashboard">Dashboard</react_router_dom_1.Link>
            </nav>
                <a className="btn btn-outline-primary" href="https://github.com/KiraLT/torrent-stream-server" target="_blank" rel="noopener noreferrer">Find on GitHub</a>
            </div>

            <react_router_1.Switch>
                <react_router_1.Route path="/" component={home_1.HomeComponent} exact/>
                <react_router_1.Route path="/play" component={play_1.PlayComponent} exact/>
                <react_router_1.Route path="/dashboard" component={dashboard_1.DashboardComponent} exact/>
            </react_router_1.Switch>
    </div>;
}
exports.ContentComponent = ContentComponent;
