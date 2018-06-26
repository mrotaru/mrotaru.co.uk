const fs = require('fs')
const mockFs = require('mock-fs')
const path = require('path')
const assert = require('assert')
const computeDiff = require('diff')
const colors = require('colors')

const { markdownToPreactComponent, markdownFoldersToComponents } = require('./index')

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

const diff = (result, expected) => {
  const _diff = computeDiff.diffLines(result, expected)
  if (_diff.length) {
    _diff.forEach(part => {
      let color = 'grey'
      const { added, removed, value} = part
      if (added) color = 'green'
      if (removed) color = 'red'
      if (added || removed) {
        process.stderr.write(value[color])
        return true
      }
    })
  }
  return false
}

const assertLinesEqual = (actual, expected) => {
  if (diff(result, expectedJs)) {
    throw new Error()
  }
}

const testMarkdownFolders = async () => {
  mockFs({
    'posts': {
      'p1': {
        'index.md': testMarkdown,
        'fig-1.svg': '<svg />'
      }
    }
  })
  await markdownFoldersToComponents('./posts')
  const outSvg = path.resolve('./build/p1/fig-1.svg')
  assert(fs.existsSync('./build/p1/index.js'))
  assert(fs.existsSync(outSvg))
  assertLinesEqual(fs.readFileSync('./build/p1/index.js', 'utf-8'), expectedJs)
  mockFs.restore()
}

testMarkdownFolders()