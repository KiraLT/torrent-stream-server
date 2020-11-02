export function formatMagnet(
    infoHash: string,
    name: string,
    trackers: string[]
) {
    const trackersQueryString = `&tr=${trackers
        .map(encodeURIComponent)
        .join('&tr=')}`
    return `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(
        name
    )}${trackersQueryString}`
}
