import { h } from 'preact';
import style from './style';
import Level from '../../components/level'
import Skill from '../../components/skill'

const Home = () => (
	<div class={style.home}>
		<h1>Mihai Rotaru</h1>
		<p>Full stack web developer based in London</p>
		<h2>Expertise</h2>
		<ul>
			<li>In-depth knowledge of vanilla <Skill name='JavaScript'/> and <Skill name='Node.js' />, including <Skill name='ES6/7' /> features</li>
			<li>Expert <Skill name='React' />, including server-rendering; <Skill name='Redux' /></li>
			<li>Databases: <Skill name='MongoDB' />, <Skill name='MySQL' />, <Skill name='Neo4j' />; using <Skill name='ElasticSearch' /> for indexing</li>
			<li>Modern <Skill name='CSS' />, layouts with <Skill name='flexbox' />, <Skill name='BEM' /> methodology</li>
			<li><Skill name='Docker' />, <Skill name='Jenkins' /> for implementing <Skill name='CI/CD' /> pipelines</li>
			<li>Implementing integration tests with <Skill name='WebdriverIO' /></li>
			<li>Shell scripting, <Skill name='Linux' /> system administration (Ubuntu server and CentOS)</li>
			<li><Skill name='AWS' /> services: <Skill name='Cognito' />, <Skill name='DynamoDB' />, <Skill name='EC2' />, <Skill name='S3' /></li>
			<li><Skill name='AngularJS (1.x)' /></li>
			<li><Skill name='C++' />, <Skill name='PHP' />, <Skill name='Python' /></li>
		</ul>
		<h2>Practices</h2>
		<ul>
			<li><Skill name='Agile' /> - quick, focused iterations help with keeping stakeholders in the loop</li>
			<li>Clean code - readability is king; keep things simple and explicit, avoid "smart" and "magic"</li>
			<li>A test-driven development process leads to higher quality software</li>
			<li>Most tests should be fast unit tests, with a few integration tests for the whole system</li>
			<li>Preffer functional programming and avoid side effects whenever possible</li>
			<li>Preffer face to face stakeholder conversations to heavy tools such as JIRA</li>
			<li><strong>Scrum</strong> provides a good framework for managing Agile processes, and can be enhanced further with <strong>Kanban</strong></li>
			<li>Cautios of "we'll fix it later" - compromising code quality is rarely worth it, even in the short term</li>
			<li>Avoid writing code that <em>might</em> be needed in the future; <strong>YAGNI</strong></li>
		</ul>
		<h2>Experience</h2>
		<ul>
			<li>06.'16 - 12.'17 - leading role in developing the marketing platform for Gamesys, a large gaming company</li>
			<li>12.'15 - 06.'16 - front-end developer for Thortful, greeting card startup</li>
			<li>01.'14 - 12.'15 - sole full-stack develpoer for a travel startup, Trufflecat</li>
			<li>01.'13 - 08.'13 - full-stack contracting for Pep Publishing, a media company </li>
		</ul>
	</div>
);

export default Home;
