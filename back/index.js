import falcor from 'falcor';
import falcorExpress from 'falcor-express';
import FalcorRouter from 'falcor-router';
import bodyParser from 'body-parser';
import express from 'express';

import { peopleRoutes } from './people_routes';
import { filmRoutes } from './film_routes';
import { planetsRoutes } from './planets_routes';
import { speciesRoutes } from './species_routes';

var app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:6060');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Max-Age', 1728000);
    next();
});
app.use(express.static('.'));

const routes = [...peopleRoutes, ...filmRoutes, ...planetsRoutes, ...speciesRoutes];
const MyRouter = FalcorRouter.createClass(routes);
app.use(
    '/model.json',
    bodyParser.urlencoded({
        extended: false
    }),
    falcorExpress.dataSourceRoute((req, res, next) => {
        try {
            return new MyRouter(req, res, next);
        } catch (e) { console.error(e); }
    })
);

const port = 3033;
const runnable = app.listen(port, (err) => {
    if (err) {
        console.error(err);
    }
    console.info('----\n==> 🌎  Falcor model is running on port %s', port);
});
