import { h, Component } from 'preact';
import html from './data.html'

export default class Post extends Component {
  render () {
    return <div dangerouslySetInnerHTML={{__html: html}} />
  }
}