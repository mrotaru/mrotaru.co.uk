import { h } from 'preact'
import style from './style';

const Skill = ({ name, tooltip }) => {
  return <span class={style.skill} title={tooltip}>{name}</span>
}

export default Skill;
