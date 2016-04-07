import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Header from './header';
import Films from './film';
import Planets from './planets';
import Species from './species';

export default class App extends Component {
    /** Gets fired when the route changes.
     *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
     *	@param {string} event.url	The newly routed URL
     */
    handleRoute = e => {
        this.currentUrl = e.url;
    };

    render() {
        return (
            <div id='app'>
				<Header />
				<Router onChange={this.handleRoute}>
					<Films path='/' />
                    <Films path='/films' />
                    <Films path='/films/:filmId' />
                    <Planets path='/planets' />
                    <Planets path='/planets/:planetId' />
                    <Species path='/species' />
					<Species path='/species/:speciesId' />
				</Router>
			</div>
        );
    }
}
