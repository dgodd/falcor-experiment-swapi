import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

export default class Header extends Component {
	render() {
		return (
			<header class={style.header}>
				<h1>SWAPI</h1>
				<nav>
					<Link href="/films">Films</Link>
					<Link href="/species">Species</Link>
					<Link href="/planets">Planets</Link>
				</nav>
			</header>
		);
	}
}
