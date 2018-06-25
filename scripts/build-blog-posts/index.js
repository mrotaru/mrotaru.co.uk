import { readFileSync } from 'fs'
import marked from 'marked'
import path from 'path'
import ent from 'ent'
import tidy from 'tidy-html5'
import cheerio from 'cheerio'

// console.log(tidy)

const defaultStartBlock = `import { h } from 'preact'
export default function Post () {
  return (`
const defaultEndBlock = `
  )
}`
const markdownToPreactComponent = (markdown, {
  startBlock = defaultStartBlock,
  endBlock = defaultEndBlock,
} = {}) => {
  const htmlFromMarkdown = ent.decode(marked(markdown))
  const combinedHtml = `
      ${htmlFromMarkdown}`
  const tidiedHtml = tidy.tidy_html5(combinedHtml, {
    'indent': 'yes',
    'omit-optional-tags': false,
    'tidy-mark': false,
    'doctype': 'omit',
    'indent-spaces': 2,
    'wrap': 0,
    'show-info': false,
  })
  const bodyHtml = cheerio.load(tidiedHtml)('body').html().trim()
  return `${startBlock}
    <div>
    ${bodyHtml}
    </div>${endBlock}`
}

const markdownFileToComponentFile = (markdownFile, {
  slug,
  outputFolder = './build',
  routes = './routes.json',
}) => {
  const markdown = readFileSync(htmlFile)
  const component = markdownToPreactComponent(markdown)
  fs.writeFileSync(path.join(outputFolder, slug, `index.js`))
}

export {
  markdownToPreactComponent,
  markdownFileToComponentFile,
}