import { routeCacheUrl, swapiUrlToId, swapiUrlToType, getPages } from './common';
import { flatten, uniq } from 'lodash';

export const speciesRoutes = [
    {
        route: 'species.count',
        async get(pathSet) {
            var species = await routeCacheUrl(this, 'http://swapi.co/api/species/?page=1');
            return {
                path: ['species', 'count'],
                value: species.count
            };
        }
    }, {
        route: 'species[{integers:indices}]',
        async get({indices}) {
            console.log('speciesById', indices);
            var pages = uniq(indices.map(i => Math.floor(i / 10)));
            var data = await getPages(this, 'species', pages);

            return indices.map(index => ({
                path: ['species', index],
                value: {
                    $type: 'ref',
                    value: ['speciesById', data[index].id]
                }
            }));
        }
    }, {
        route: 'speciesById[{keys:ids}]["id","name","classification","designation","average_height","skin_colors","hair_colors","eye_colors","average_lifespan","homeworld","language", "created", "edited"]',
        async get({ids, 2: attributes}) {
            console.log('speciesById', ids, attributes);
            if (!this.cache)
                this.cache = {};
            if (!this.cache.species) {
                this.cache.species = {};
            }
            var data = await Promise.all(ids.map(async (id) => {
                var species = this.cache.species[id];
                if (!species)
                    species = this.cache.species[id] = await routeCacheUrl(this, `http://swapi.co/api/species/${id}/`);
                species.id = id;
                return attributes.map((attribute) => {
                    return {
                        path: ['speciesById', id, attribute],
                        value: species[attribute]
                    }
                });
            }));
            return flatten(data);
        }
    }
];
