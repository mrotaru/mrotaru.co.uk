import { h } from 'preact';
import style from './style';
import Level from '../../components/level'

const Home = () => (
	<div class={style.home}>
		<h1>Mihai Rotaru</h1>
		<p>Full stack web developer based in London</p>
		<h2>Expertise</h2>
		<p style={{fontSize: 'small'}}>
			<Level level={5} label=' = Expert, ' />
			<Level level={4} label=' = Proficient, ' />
			<Level level={3} label=' = Competent, ' />
			<Level level={2} label=' = Advanced Beginner, ' />
			<Level level={1} label=' = Beginner'/>
		</p>
		<ul>
			<li>In-depth knowledge of vanilla <strong>JavaScript <Level level={5}/></strong> and <strong>Node.js <Level level={5} /></strong>, including <strong>ES6/7</strong> features</li>
			<li>Expert <strong>React <Level level={5} /></strong>, including server-rendering; <strong>Redux <Level level={5} /></strong></li>
			<li>Databases: <strong>MongoDB <Level level={4} /></strong>, <strong>MySQL <Level level={3} /></strong>, <strong>Neo4j <Level level={1} /></strong></li>
			<li>Modern <strong>CSS <Level level={3} /></strong>, layouts with <strong>flexbox</strong>, <strong>BEM</strong> methodology</li>
			<li><strong>Docker <Level level={3} /></strong>, <strong>Jenkins <Level level={4} /></strong> for implementing <strong>CI/CD</strong> pipelines</li>
			<li>Shell scripting, Linux system administration (Ubuntu server and CentOS)</li>
			<li><strong>AWS</strong> services: <strong>Cognito</strong>, <strong>DynamoDB</strong>, <strong>EC2</strong>, <strong>S3</strong></li>
			<li><strong>Angular 1.3, 1.4 <Level level={4} /></strong></li>
			<li><strong>ElasticSearch <Level level={2} /></strong></li>
			<li><strong>C++ <Level level={3} /></strong>, <strong>PHP <Level level={2} /></strong>, <strong>Python <Level level={2} /></strong></li>
		</ul>
		<h2>Practices</h2>
		<ul>
			<li><strong>Agile</strong> - quick, focused iterations help with keeping stakeholders in the loop</li>
			<li>Clean code - readability is king; keep things as simple as possible and avoid "smart" but complex solutions</li>
			<li>A test-driven development process leads to higher quality software</li>
			<li>Most tests should be fast unit tests, with a few integration tests for the whole system</li>
			<li>Preffer functional programming and avoid side effects whenever possible</li>
			<li>Preffer face to face stakeholder conversations to heavy tools such as JIRA</li>
			<li><strong>Scrum</strong> provides a good framework for managing Agile processes, and can be enhanced further with <strong>Kanban</strong></li>
			<li>Cautions of "we'll fix it later" - compromising code quality is rarely worth it, even in the short term</li>
			<li>Avoid writing code that <em>might</em> be needed in the future; <strong>YAGNI</strong></li>
		</ul>
	</div>
);

export default Home;
