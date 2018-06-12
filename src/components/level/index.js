import { h } from 'preact'
import style from './style';

const Level = ({level, label = ''}) => {
	let char = ''
	let title = ''
	switch (level) {
		case 1: char = '⚀'; title = 'Beginner'; break;
		case 2: char = '⚁'; title = 'Advanced Beginner'; break;
		case 3: char = '⚂'; title = 'Competent'; break;
		case 4: char = '⚃'; title = 'Proficient'; break;
		case 5: char = '⚄'; title = 'Expert'; break;
	}
	return <span title={title} class={style.level}>{char}{label}</span>
}

export default Level;
