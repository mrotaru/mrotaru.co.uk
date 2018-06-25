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
const htmlToPreactComponent = (markdown, {
  publishedDate, author,
  startBlock = defaultStartBlock,
  endBlock = defaultEndBlock,
}) => {
  const htmlFromMarkdown = ent.decode(marked(markdown))
  const authorHtml = author && `<small>Author: <a href="${author.url}">${author.name}</a></small>`
  const publishedDateHtml = publishedDate && `<small>${publishedDate}</small>`
  const combinedHtml = `
      ${publishedDate && publishedDateHtml}
      ${author && authorHtml}
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

const htmlFileToComponentFile = (htmlFile, {
  slug,
  outputFolder = './build',
  routes = './routes.json',
  getPublishedDate = () => '2018-06-16',
  getAuthor = () => 'John',
}) => {
  const html = readFileSync(htmlFile)
  const component = htmlToPreactComponent(html)
  fs.writeFileSync(path.join(outputFolder, `${slug}.js`))
}

export {
  htmlToPreactComponent,
  htmlFileToComponentFile,
}