import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
var model = new falcor.Model({
    source: new HttpDataSource('http://localhost:3033/model.json')
});
export default model;
