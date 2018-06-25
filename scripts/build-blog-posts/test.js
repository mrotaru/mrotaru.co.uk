const fs = require('fs')
const mockFs = require('mock-fs')
const assert = require('assert')
const computeDiff = require('diff')
const colors = require('colors')

const { markdownToPreactComponent } = require('./index')

const testMarkdown = `
<small>Author: <a href="www.john.com">John</a></small>
<small>Date: 2018-06-16</small>
# Title
Some _markdown_ **text**
`
const expectedJs = `import { h } from 'preact'
export default function Post () {
  return (
    <div>
    <p>
      <small>Author: <a href="www.john.com">John</a></small> <small>Date: 2018-06-16</small>
    </p>
    <h1 id="title">
      Title
    </h1>
    <p>
      Some <em>markdown</em> <strong>text</strong>
    </p>
    </div>
  )
}`

const result = markdownToPreactComponent(testMarkdown)

const diff = computeDiff.diffLines(result, expectedJs)
if (diff.length) {
  diff.forEach(part => {
    let color = 'grey'
    const { added, removed, value} = part
    if (added) color = 'green'
    if (removed) color = 'red'
    process.stderr.write(value[color])
  })
}
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