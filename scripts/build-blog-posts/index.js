import fs from 'fs'
import marked from 'marked'
import path from 'path'
import ent from 'ent'
import tidy from 'tidy-html5'
import cheerio from 'cheerio'

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
    'show-warnings': false,
    'error-file': '/dev/null',
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
  const markdown = fs.readFileSync(markdownFile, 'utf-8')
  const component = markdownToPreactComponent(markdown)
  fs.mkdirSync(path.join(outputFolder, slug))
  const outputPath = path.join(outputFolder, slug, `index.js`) 
  console.log('writing: ', outputPath)
  fs.writeFileSync(outputPath, markdownToPreactComponent(markdown))
}

const markdownFoldersToComponents = (folder, outputFolder = './build', routesFile = './routes.json') => {
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder)
  }
  fs.readdirSync(folder).forEach(file => {
    const filePath = path.join(folder, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      fs.readdirSync(filePath).forEach(nestedFile => {
        const nestedFilePath = path.join(filePath, nestedFile)
        const slug = path.basename(filePath)
        if (path.extname(nestedFile) === '.md') {
          markdownFileToComponentFile(nestedFilePath, {
            slug,
            outputFolder,
            routes: routesFile,
          })
        } else {
          fs.promises.copyFile(nestedFilePath, path.join(outputFolder, slug))
        }
      })
    }
  })
}

export {
  markdownToPreactComponent,
  markdownFileToComponentFile,
  markdownFoldersToComponents,
}