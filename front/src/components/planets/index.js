import { h, Component } from 'preact';
import { route } from 'preact-router';
import model from '../../lib/falcor-model';
import { map, sortBy, range, filter } from 'lodash';
import style from './style';

export class DetailInner extends Component {
    static queries() { return [[["name","classification","designation","average_height","skin_colors","hair_colors","eye_colors"]]] };

    render({ species }) {
        return (
            <div>
                <h1>{species.name}</h1>
                <dl>
                    <dt>classification</dt><dd>{species.classification}</dd>
                    <dt>designation</dt><dd>{species.designation}</dd>
                    <dt>average_height</dt><dd>{species.average_height}</dd>
                    <dt>skin_colors</dt><dd>{species.skin_colors}</dd>
                    <dt>hair_colors</dt><dd>{species.hair_colors}</dd>
                    <dt>eye_colors</dt><dd>{species.eye_colors}</dd>
                </dl>
            </div>
        )
    }
}

export class Detail extends Component {
    state = { species: null };
    
    getData(speciesId) {
        this.setState({ species: null });
        if (!speciesId) return;
        model.get(
            ['speciesById',speciesId,["id"]],
            ...DetailInner.queries().map(q => ['speciesById',speciesId,...q]),
        ).then((data) => {
            this.setState({ species: data.json.speciesById[speciesId] });
        }).catch((err) => console.log(["err", err]) );
	}
    componentDidMount() {
        this.getData(this.props.speciesId);
    }
    componentWillReceiveProps({ speciesId }) {
        this.getData(speciesId);
    }
    render({}, { species }) {
        if(species) {
            return (<DetailInner species={species} />);
        }
        return (this.props.speciesId ? <h1>Loading...</h1> : null);
    }
}


export  class Item extends Component {
    static queries() { return [[["name"]]] };
    
    render({ specie, active }) {
        if (!specie) return '';
        return (
          <div style={{color:(active?'red':'green')}} onclick={this.props.onSelect}>
                <h3>{specie.name}</h3>
          </div>  
        );
    }
}

export default class Planets extends Component {
	state = {
		planets: [], maxPlanets: 9
	};

	// gets called when this route is navigated to
    componentDidMount() {
        this.getData();
    }
    getData() {
        model.get(
            ['planets','count'],
            ['planets',{from:0,to:this.state.maxPlanets},"id"],
            ...Item.queries().map(q => ['planets',{from:0,to:this.state.maxPlanets},...q]),
        ).then((data) => {
            console.log('then', data.json);
            this.setState({ planets: data.json.planets });
        }).catch(e => console.log(e));
    }
    increase() {
        this.setState({ maxPlanets: this.state.maxPlanets + 10 });
        console.log(this.state.maxPlanets);
        this.getData();
    }
    
    onSelect(item) {
        route(`/planets/${item.id}`)
    }

    render({ planetsId }, { planets, maxPlanets }) {
        console.log('render');
        var arr = filter(map(range(planets.count), (i) => planets[i]), (s) => s);
        //arr = sortBy(arr, (s) => s.name);
        
		return (
			<div class={style.planets}>
                <div class={style.list}>
                    <h1>Planets : { planets.count }</h1>
                    <div>
                        {map(arr, (item) => <Item specie={item} active={item.id==planetsId} onSelect={this.onSelect.bind(this,item)} />)}
                    </div>
                    { planets.count && maxPlanets < planets.count ?
                        <div><a onclick={this.increase.bind(this) }>more</a></div>
                        : '' }
                </div>
                <div class={style.details}>
                    <Detail speciesId={planetsId} />
                </div>
			</div>
		);
	}
}
