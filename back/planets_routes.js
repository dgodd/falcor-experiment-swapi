import { routeCacheUrl, swapiUrlToId, swapiUrlToType, getPages } from './common';
import { flatten, uniq } from 'lodash';

export const planetsRoutes = [
    {
        route: 'planets.count',
        async get(pathSet) {
            var planets = await routeCacheUrl(this, 'http://swapi.co/api/planets/?page=1');
            return {
                path: ['planets', 'count'],
                value: planets.count
            };
        }
    }, {
        route: 'planets[{integers:indices}]',
        async get({indices}) {
            console.log('planetsById', indices);
            var pages = uniq(indices.map(i => Math.floor(i / 10)));
            var data = await getPages(this, 'planets', pages);

            return indices.map(index => ({
                path: ['planets', index],
                value: {
                    $type: 'ref',
                    value: ['planetsById', data[index].id]
                }
            }));
        }
    }, {
        route: 'planetsById[{keys:ids}]["id","name","rotation_period","orbital_period","diameter","climate","gravity","terrain","surface_water","population","created","edited"]',
        async get({ids, 2: attributes}) {
            console.log('planetsById', ids, attributes);
            if (!this.cache)
                this.cache = {};
            if (!this.cache.planets) {
                this.cache.planets = {};
            }
            var data = await Promise.all(ids.map(async (id) => {
                var planets = this.cache.planets[id];
                if (!planets)
                    planets = this.cache.planets[id] = await routeCacheUrl(this, `http://swapi.co/api/planets/${id}/`);
                planets.id = id;
                return attributes.map((attribute) => {
                    return {
                        path: ['planetsById', id, attribute],
                        value: planets[attribute]
                    }
                });
            }));
            return flatten(data);
        }
    }
];
