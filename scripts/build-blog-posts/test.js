const fs = require('fs')
const mockFs = require('mock-fs')
const assert = require('assert')

const { htmlToPreactComponent } = require('./index')

const testMarkdown = `# Title
Some _markdown_ **text**
`
const expectedJs = `import { h } from 'preact'
export default function Post () {
  return (
    <div>
    <small>2018-06-16</small> <small>Author: <a href="www.john.com">John</a></small>
    <h1 id="title">
      Title
    </h1>
    <p>
      Some <em>markdown</em> <strong>text</strong>
    </p>
    </div>
  )
}`

const result = htmlToPreactComponent(testMarkdown, {
  publishedDate: '2018-06-16',
  author: {
    name: 'John',
    url: 'www.john.com',
  }
})

assert(result === expectedJs)

// mockFs({
//   'posts': {
//     'p1': {
//       'index.md': `# Title
//       Some _markdown_ **text**
//       `
//     }
//   }
// })
// assert(fs.existsSync('./build/p1/index.js'))
// assert(fs.readFileSync('./build/p1/index.js') === expectedJs)
// mockFs.restore()