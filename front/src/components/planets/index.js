import { h, Component } from 'preact';
import { route, Link } from 'preact-router';
import model from '../../lib/falcor-model';
import { map, sortBy, range, filter } from 'lodash';
import style from './style';

export class Planet extends Component {
    static queries() { return [[["name"]]] };
    
    render({ planet, active }) {
        if (!planet) return '';
        return (
          <div style={{width:'300px',color:(active?'red':'green')}} onclick={this.props.onSelect}>
                <h3>{planet.name}</h3>
          </div>  
        );
    }
}

export class DetailInner extends Component {
    static queries() { return [[["id","name","climate","diameter","gravity","orbital_period",'population','rotation_period','surface_water','terrain']]] };

    render({ planet }) {
        return (
            <div>
                <h1>{planet.name}</h1>
                <dl>
                    <dt>climate</dt><dd>{planet.climate}</dd>
                    <dt>diameter</dt><dd>{planet.diameter}</dd>
                    <dt>gravity</dt><dd>{planet.gravity}</dd>
                    <dt>orbital_period</dt><dd>{planet.orbital_period}</dd>
                    <dt>population</dt><dd>{planet.population}</dd>
                    <dt>rotation_period</dt><dd>{planet.rotation_period}</dd>
                    <dt>surface_water</dt><dd>{planet.surface_water}</dd>
                    <dt>terrain</dt><dd>{planet.terrain}</dd>
                </dl>
            </div>
        )
    }
}

export class Detail extends Component {
    state = { planet: null };
    
    getData(planetId) {
        this.setState({ planet: null });
        if (!planetId) return;
        model.get(
            ['planetsById',planetId,["id","name"]],
            ...DetailInner.queries().map(q => ['planetsById',planetId,...q]),
        ).then((data) => {
            this.setState({ planet: data.json.planetsById[planetId] });
        }).catch((err) => console.log(["err", err]) );
	}
    componentDidMount() {
        this.getData(this.props.planetId);
    }
    componentWillReceiveProps({ planetId }) {
        this.getData(planetId);
    }
    render({}, { planet }) {
        if(planet) {
            return (<DetailInner planet={planet} />);
        }
        return (this.props.planetId ? <h1>Loading...</h1> : null);
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
            ...Planet.queries().map(q => ['planets',{from:0,to:this.state.maxPlanets},...q]),
        ).subscribe((data) => {
            this.setState({ planets: data.json.planets });
        });
	}
    
    onSelect(planet) {
        route(`/planets/${planet.id}`)
    }

    increase() {
        this.setState({ maxPlanets: this.state.maxPlanets + 10 });
        this.getData();
    }    

    render({ planetId }, { planets, maxPlanets }) {
        var planetArr = filter(map(range(planets.count), (i) => planets[i]));

		return (
			<div class={style.planets}>
                <div class={style.list}>
                    <h1>Planets : { planets.count }</h1>
                    <div>
                        {map(planetArr, (planet) => <Planet planet={planet} active={planet.id==planetId} onSelect={this.onSelect.bind(this,planet)} />)}
                    </div>
                    { planets.count && maxPlanets < planets.count ?
                        <div><a onclick={this.increase.bind(this) }>more</a></div>
                        : '' }
                </div>
                <div class={style.details}>
                    <Detail planetId={planetId} />
                </div>
			</div>
		);
	}
}
