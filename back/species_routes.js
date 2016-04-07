import { routeCacheUrl, swapiUrlToId, swapiUrlToType, getPages } from './common';
import { flatten, uniq, map } from 'lodash';

function setupSimpleCache(obj, routeBasename) {
    if (!obj.cache) obj.cache = {};
    if (!obj.cache[routeBasename]) obj.cache[routeBasename] = {};
}
import * as jsonGraph from 'falcor-json-graph';
const routeSuffixLength = 'count';
export function createGetLengthRoute(routeBasename, getLengthPromise) {
  return {
    route: routeBasename + '.' + routeSuffixLength,
    async get(pathSet) {
        console.log(pathSet);
        setupSimpleCache(this, routeBasename);
        const length = await getLengthPromise(this);
        return jsonGraph.pathValue(pathSet, length);
    }
  };
}
export function createGetRangesRoute(routeBasename, getRangePromise) {
    var routeByIdBasename = `${routeBasename}ById`;
    return {
        route: `${routeBasename}[{integers:indices}]`,
        async get({indices}) {
            console.log([routeBasename, indices]);
            setupSimpleCache(this, routeBasename);
            var data = await getRangePromise(this, indices);
            return indices.map(index => 
                jsonGraph.pathValue([routeBasename, index], jsonGraph.ref([routeByIdBasename, data[index].id]))
            );
        }
    }
}
export const getPageIdsFromIndices = (indices => uniq(map(indices, i => Math.floor(i / 10))));

export function createGetByIdRoute(routeBasename, attributes, getByIdPromise) {
    var routeByIdBasename = `${routeBasename}ById`;
    return {
        route: `${routeByIdBasename}[{keys:ids}]${JSON.stringify(attributes)}`,
        async get({ids, 2: attributes}) {
            console.log(`${routeBasename}ById`, ids, attributes);
            setupSimpleCache(this, routeBasename);
            var data = await Promise.all(ids.map(async (id) => {
                var obj = this.cache[routeBasename][id];
                if (!obj)
                    obj = this.cache[routeBasename][id] = await getByIdPromise();
                obj.id = id;
                return attributes.map((attribute) => {
                    return {
                        path: [routeByIdBasename, id, attribute],
                        value: obj[attribute]
                    }
                });
            }));
            return flatten(data);
        }
    };
}

export const speciesRoutes = [
    createGetLengthRoute('species', (obj) =>
        routeCacheUrl(obj, 'http://swapi.co/api/species/?page=1').then(o => o.count)
    ),
    createGetRangesRoute('species', (obj, indices) => {
        var pages = getPageIdsFromIndices(indices);
        return getPages(obj, 'species', pages);
    }),
    createGetByIdRoute('species', ["id", "name", "classification", "designation", "average_height", "skin_colors", "hair_colors", "eye_colors", "average_lifespan", "homeworld", "language", "created", "edited"],
        (obj, id) => routeCacheUrl(obj, `http://swapi.co/api/species/${id}/`)
    )
];
