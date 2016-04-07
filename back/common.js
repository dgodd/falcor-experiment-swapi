const origFetch = require('node-fetch');

export function fetch(url) {
	url = url.replace(/^http:\/\/swapi.co\//, 'http://localhost:3034/');
	return origFetch(url);
}

export function routeCacheUrl(obj, url) {
    if (!obj.cache)
        obj.cache = {};
    if (!obj.cache[url]) {
        console.log('Fetch: ' + url);
        obj.cache[url] = fetch(url).then(r => r.json());
    }
    return obj.cache[url];
}

export function swapiUrlToId(url) {
    return parseInt(url.replace(/^http:\/\/swapi.co\/api\/[^\/]+\/(\d+)\/$/, '$1'));
}

export function swapiUrlToType(url) {
    return url.replace(/^http:\/\/swapi.co\/api\/([^\/]+)\/\d+\/$/, '$1');
}

export function swapiUrlToRef(url) {
    var id = swapiUrlToId(url);
    var type = swapiUrlToType(url);
    return {
        $type: 'ref',
        value: [`${type}ById`, id]
    }
}

export async function getPages(obj, type, pages) {
    if (!obj.cache)
        obj.cache = {};
    if (!obj.cache[type])
        obj.cache[type] = {};
    var indexedData = [];

    await Promise.all(pages.map(async (page) => {
        var data = await routeCacheUrl(obj, `http://swapi.co/api/${type}/?page=${page + 1}`);
        data.results.forEach((o, idx) => {
            o.id = swapiUrlToId(o.url);
            if(o.id)
                obj.cache[type][o.id] = o;
            indexedData[(page * 10) + idx] = o;
        });
    }));

    return indexedData;
}
