"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProviderSupported = exports.search = exports.getProvidersInfo = exports.providers = void 0;
const nyaa_1 = require("./providers/nyaa");
const thepiratebay_1 = require("./providers/thepiratebay");
exports.providers = {
    [nyaa_1.NyaaProvider.providerName]: new nyaa_1.NyaaProvider(),
    [thepiratebay_1.ThepiratebayProvider.providerName]: new thepiratebay_1.ThepiratebayProvider()
};
async function getProvidersInfo() {
    return Promise.all(Object.entries(exports.providers).map(async ([name, provider]) => {
        const meta = await provider.getMeta();
        return {
            name,
            ...meta
        };
    }));
}
exports.getProvidersInfo = getProvidersInfo;
async function search(searchProviders, query, options) {
    if (searchProviders.length !== 1) {
        throw new Error('Only 1 provider search is supported at the moment');
    }
    const provider = searchProviders[0];
    return exports.providers[provider].search(query, options);
}
exports.search = search;
function isProviderSupported(name) {
    if (typeof name === 'string' && name in exports.providers) {
        return true;
    }
    return false;
}
exports.isProviderSupported = isProviderSupported;
