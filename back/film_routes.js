import { routeCacheUrl, swapiUrlToId, swapiUrlToType, swapiUrlToRef, getPages } from './common';
import { flatten, uniq } from 'lodash';
import fetch from 'node-fetch';

export const filmRoutes = [
    {
        route: 'films.count',
        async get(pathSet) {
            var films = await routeCacheUrl(this, 'http://swapi.co/api/films/?page=1');
            return {
                path: ['films', 'count'],
                value: films.count
            };
        }
    }, {
        route: 'films[{integers:indices}]',
        async get({indices}) {
            console.log('films', indices);
            var pages = uniq(indices.map(i => Math.floor(i / 10)));
            var data = await getPages(this, 'films', pages);

            return indices.map(index => ({
                path: ['films', index],
                value: {
                    $type: 'ref',
                    value: ['filmsById', data[index].id]
                }
            }));
        }
    }, {
        route: 'filmsById[{keys:ids}]["id", "title", "episode_id", "opening_crawl", "director", "producer", "release_date", "created", "edited"]',
        async get({ids, 2: attributes}) {
            console.log('filmsById', ids, attributes);
            if (!this.cache)
                this.cache = {};
            if (!this.cache.film)
                this.cache.film = {};
            var data = await Promise.all(ids.map(async (id) => {
                var film = this.cache.film[id];
                if (!film)
                    film = this.cache.film[id] = await routeCacheUrl(this, `http://swapi.co/api/films/${id}/`);
                film.id = id;
                return attributes.map((attribute) => {
                    return {
                        path: ['filmsById', id, attribute],
                        value: film[attribute]
                    }
                });
            }));
            console.log(flatten(data));
            return flatten(data);
        }
    }, {
        route: 'filmsById[{keys:ids}]["Title", "tomatoReviews", "tomatoMeter", "Awards", "Poster"]',
        async get({ids, 2: attributes}) {
            console.log('filmsById', ids, attributes);
            if (!this.cache)
                this.cache = {};
            if (!this.cache.film)
                this.cache.film = {};
            var data = await Promise.all(ids.map(async (id) => {
                var film = this.cache.film[id];
                if (!film)
                    film = this.cache.film[id] = await routeCacheUrl(this, `http://swapi.co/api/films/${id}/`);
                var year = film.release_date.replace(/\-.*/, '');
                var omdb = await routeCacheUrl(this, `http://www.omdbapi.com/?t=Star%20Wars&type=movie&tomatoes=true&y=${year}`);
                return attributes.map((attribute) => {
                    return {
                        path: ['filmsById', id, attribute],
                        value: omdb[attribute]
                    }
                });
            }));
            return flatten(data);
        }
    }, {
        route: 'filmsById[{keys:ids}]["planets","characters","species"].count',
        async get({ids, 2: attributes}) {
            console.log(['filmsById', ids, attributes]);
            if (!this.cache)
                this.cache = {};
            if (!this.cache.film)
                this.cache.film = {};
            var data = flatten(ids.map(async (id) => {
                var film = this.cache.film[id];
                if (!film)
                    film = this.cache.film[id] = await routeCacheUrl(this, `http://swapi.co/api/films/${id}/`);
                return attributes.map((attribute) => {
                    return {
                        path: ['filmsById', id, attribute, 'count'],
                        value: film[attribute].length
                    }
                })
            }));

            data = await Promise.all(data);
            data = flatten(flatten(data));
            return data;
        }
    }, {
        route: 'filmsById[{keys:ids}]["planets","characters","species"][{integers:indices}]',
        async get({ids, 2: attributes, indices}) {
            console.log(['filmsById', ids, attributes, indices]);
            if (!this.cache)
                this.cache = {};
            if (!this.cache.film)
                this.cache.film = {};
            var data = flatten(ids.map(async (id) => {
                var film = this.cache.film[id];
                if (!film)
                    film = this.cache.film[id] = await routeCacheUrl(this, `http://swapi.co/api/films/${id}/`);
                return attributes.map((attribute) => {
                    return indices.map((idx) => {
                        var url = film[attribute][idx];
                        return {
                            path: ['filmsById', id, attribute, idx],
                            value: {
                                $type: 'ref',
                                value: [`${attribute}ById`, swapiUrlToId(url)]
                            }
                        }
                    });
                })
            }));

            data = await Promise.all(data);
            data = flatten(flatten(data));
            return data;
        }
    }
];