import { h } from 'preact';
import html from './data.html'

export default function Post () {
  return <div dangerouslySetInnerHTML={{__html: html}} />
}