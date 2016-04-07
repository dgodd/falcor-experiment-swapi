import Hapi from 'hapi';
import fs from 'fs';
import { assign, find, map, forIn, forEach, includes, union } from 'lodash';

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    host: 'localhost', 
    port: 3034 
});

const keys = ['films', 'people', 'planets', 'species', 'starships', 'vehicles'];
const dataArrays = {};
forEach(keys, (name) => {
    var data = JSON.parse(fs.readFileSync(`fixtures/${name}.json`, 'utf8'))
    dataArrays[name] = data;
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
            var results = dataArrays[key].slice(offset, offset + 10);
            return reply({
                count: dataArrays[key].length,
                results: results
            });
        }
    });
    server.route({
        method: 'GET',
        path: `/api/${key}/{id}/`,
        handler: function(request, reply) {
            var id = parseInt(request.params.id, 10);
            var obj = find(dataArrays[key], o => o.url == `http://swapi.co/api/${key}/${id}/`);
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