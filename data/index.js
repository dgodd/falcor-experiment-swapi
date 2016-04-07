import Hapi from 'hapi';
import fs from 'fs';
import { assign, find, map, forIn, forEach, includes, union } from 'lodash';

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 3034 
});

const foreignKeyUrl = (type, id) => `http://swapi.co/api/${type}/${id}/`;
const keys = ['films', 'people', 'planets', 'species', 'starships', 'transport', 'vehicles'];
const dataArrays = {};
const dataHashes = {};
forEach(keys, (name) => {
    var data = JSON.parse(fs.readFileSync(`fixtures/${name}.json`, 'utf8'))
    dataHashes[name] = {}
    forEach(data, (obj) => {
        obj.fields.url = foreignKeyUrl(name, obj.pk);
        dataHashes[name][parseInt(obj.pk,10)] = obj.fields;
    });
    dataArrays[name] = map(data, 'pk');
});
forEach(keys, (name) => {
    forEach(dataHashes[name], (obj, id) => {
        id = parseInt(id, 10);
        forEach(keys, key => {
            var key2 = key == 'people' ? 'characters' : key;
            if (obj[key2]) {
                forEach(obj[key2], (fk) => {
                    if (dataHashes[key][fk]) {
                        if (!dataHashes[key][fk][name]) dataHashes[key][fk][name] = [];
                        if (!includes(dataHashes[key][fk][name], id)) dataHashes[key][fk][name].push(id);
                    }
                });
            }
        });
    });
});
forEach(dataHashes['films'], obj => {
    obj.characters = union(obj.characters, obj.people);
    delete obj.people;
});
forEach(dataHashes, (obj2, name) => {
    forEach(obj2, (obj) => {
        forEach([...keys, 'characters'], (key) => {
            var key2 = key == 'characters' ? 'people' : key;
            if (obj[key]) {
                obj[key] = map(obj[key], id => foreignKeyUrl(key2, id));
            }
        });
    });
});    

const getOffsetFromPage = (page) => {
    page = parseInt(page, 10);
    if (!(page > 0)) page = 1;
    var offset = (page - 1) * 10;
    return offset;
}

forEach(keys, (key) => {
    server.route({
        method: 'GET',
        path: `/api/${key}/`,
        handler: function(request, reply) {
            var offset = getOffsetFromPage(request.query.page);
            var ids = dataArrays[key].slice(offset, offset + 10);
            return reply({
                count: dataArrays[key].length,
                results: map(ids, id => dataHashes[key][id])
            });
        }
    });
    server.route({
        method: 'GET',
        path: `/api/${key}/{id}/`,
        handler: function(request, reply) {
            var id = parseInt(request.params.id, 10);
            var obj = dataHashes[key][id];
            return reply(obj);
        }
    });
});    

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});