"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initApp = void 0;
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const react_router_dom_1 = require("react-router-dom");
const content_1 = require("./components/content");
const serviceWorker_1 = require("./serviceWorker");
function initApp(target) {
    registerWebworker();
    react_dom_1.default.render(<react_router_dom_1.BrowserRouter>
            <content_1.ContentComponent />
        </react_router_dom_1.BrowserRouter>, target);
}
exports.initApp = initApp;
function registerWebworker() {
    serviceWorker_1.register({
        onUpdate: () => {
            const div = document.createElement('div');
            div.style.position = 'fixed';
            div.style.bottom = '0';
            div.style.left = '0';
            div.style.right = '0';
            div.style.zIndex = '9999';
            div.style.textAlign = 'center';
            div.style.background = 'rgba(208, 208, 208, 0.90)';
            div.style.padding = '2px';
            div.className = 'text-secondary';
            div.innerHTML = `
                New content is available and will be used when all tabs for this page are closed
                <button class="btn btn-link" onClick="this.parentNode.style.display = 'none'">
                    x
                </button>`;
            document.body.appendChild(div);
        }
    });
}
