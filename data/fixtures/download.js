import fetch from 'node-fetch';
import fs from 'fs';
import { forEach } from 'lodash';

const keys = ['films', 'people', 'planets', 'species', 'starships', 'transport', 'vehicles'];

forEach(keys, async (type) => {
    var page = 0;
    var maxPage = null;
    var results = [];
    do {
        page = page + 1;
        var data = await fetch(`http://swapi.co/api/${type}?page=${page}`).then(r => r.json());
        maxPage = Math.ceil(data.count / 10);
        results = results.concat(data.results);
    } while (page < maxPage);
    var fileName = `fixtures/${type}.json`;
    console.log(results.length, fileName);
    var err = await fs.writeFile(fileName, JSON.stringify(results, null, 2));
    console.log(err);
});
