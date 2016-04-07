import { createRoutes } from 'falcor-saddle';
import { fetch, swapiUrlToId } from './common';

export const peopleRoutes = createRoutes({
    routeBasename: 'people',
    acceptedKeys: ['id', 'name', 'height', 'mass', 'hair_color', 'skin_color', 'eye_color', 'birth_year', 'gender', 'homeworld', 'created', 'edited'],
    getLength: () => 87,
    getRange: async (from, to) => {
        console.log('getRange', from, to);
        return fetch('http://swapi.co/api/people/?page=1')
            .then((res) => res.json())
            .then((j) => j.results).then((arr) => {
            console.log(arr);
            arr.forEach((e) => e.id = swapiUrlToId(e.url)
            );
            return arr;
        })
            .then((j) => {
                console.log(j);return j;
            });
    },
    getById: async (id) => {
        console.log('getById', id);
        return fetch(`http://swapi.co/api/people/${id}/`).then((res) => res.json())
            .then((e) => {
                e.id = swapiUrlToId(e.url);
                return e;
            })
            .then((j) => {
                console.log(j);return j;
            });
    },
    update: async (oldObj, newObj) => oldObj.merge(newObj).save(),
    create: async (params) => {
    },
    delete: async (id) => {
    }
});
