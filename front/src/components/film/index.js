import { h, Component } from 'preact';
import { route, Link } from 'preact-router';
import model from '../../lib/falcor-model';
import { map, sortBy, range, filter } from 'lodash';
import style from './style';

export class Film extends Component {
    static queries() { return [[["title","episode_id"]]] };
    
    render({ film, active }) {
        if (!film) return '';
        return (
          <div style={{width:'300px',color:(active?'red':'green')}} onclick={this.props.onSelect}>
                <h3>{film.title} ({film.episode_id})</h3>
          </div>  
        );
    }
}

export class DetailInner extends Component {
    static queries() { return [[["id","title","Title","episode_id","Poster","Awards","tomatoMeter"]], ["planets","count"], ["planets",{from:0,to:2},["id","name"]], ["species","count"], ["species",{from:0,to:2},["id","name"]]] };
    // static queries() { return [[["id","title","episode_id","Poster"]]]; }

    render({ film }) {
        window.myFilm = film;
        return (
            <div>
                <img src={film.Poster} style="float:right" />
                <h1>{film.title} ({film.episode_id}) </h1>
                <div>Awards: {film.Awards}</div>
                <div>TomatoMeter: {film.tomatoMeter}</div>                
                <div>Planets ({film.planets.count}): {map(filter(film.planets, p => p && p.id), (p) => <Link href={`/planets/${p.id}`}>{p.name}, </Link>)}</div>
                <div>Species ({film.species.count}): {map(filter(film.species, s => s && s.id), (s) => <Link href={`/species/${s.id}`}>{s.name}, </Link>)}</div>
            </div>
        )
    }
}

export class Detail extends Component {
    state = { film: null };
    
    getData(filmId) {
        this.setState({ film: null });
        if (!filmId) return;
        model.get(
            ['filmsById',filmId,["id","Title","episode_id","Poster"]],
            ...DetailInner.queries().map(q => ['filmsById',filmId,...q]),
        ).then((data) => {
            this.setState({ film: data.json.filmsById[filmId] });
        }).catch((err) => console.log(["err", err]) );
	}
    componentDidMount() {
        this.getData(this.props.filmId);
    }
    componentWillReceiveProps({ filmId }) {
        this.getData(filmId);
    }
    render({}, { film }) {
        if(film) {
            return (<DetailInner film={film} />);
        }
        return (this.props.filmId ? <h1>Loading...</h1> : null);
    }
}

export default class Films extends Component {
	state = {
		films: []
	};

	// gets called when this route is navigated to
	componentDidMount() {
        model.get(
            ['films','count'],
            ['films',{from:0,to:6},"id"],
            ...Film.queries().map(q => ['films',{from:0,to:6},...q]),
        ).subscribe((data) => {
            window.myFilms = data.json.films;
            this.setState({ films: data.json.films });
        });
	}
    
    onSelect(film) {
        // this.setState({ film });
        route(`/films/${film.id}`)
    }

    render({ filmId }, { films }) {
        var filmArr = map(range(films.count), (i) => films[i]);
        filmArr = sortBy(filmArr, (f) => f.episode_id);
        
		return (
			<div class={style.films}>
                <div class={style.list}>
                    <h1>Films : { films.count }</h1>
                    <div style="display:flex; flex-wrap: wrap; justify-content: space-between;">
                        {map(filmArr, (film) => <Film film={film} active={film.id==filmId} onSelect={this.onSelect.bind(this,film)} />)}
                    </div>
                </div>
                <div class={style.details}>
                    <Detail filmId={filmId} />
                </div>
			</div>
		);
	}
}
