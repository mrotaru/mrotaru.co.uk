import fs from 'fs'
import marked from 'marked'
import { normalize, join, resolve, extname, basename } from 'path'
import ent from 'ent'
import tidy from 'tidy-html5'
import cheerio from 'cheerio'
import assert from 'assert'
import rimraf from 'rimraf'

const defaultStartBlock = `import { h } from 'preact'
export default function Post () {
  return (`
const defaultEndBlock = `
  )
}`

const renderer = new marked.Renderer()

const markdownToHtml = (markdown, {
  markedOptions = {},
  decodeHtmlEntities = true,
} = {}) => {
  marked.setOptions(Object.assign({ xhtml: true }, ...markedOptions ))
  let htmlFromMarkdown = marked(markdown, { renderer })
  return decodeHtmlEntities
    ? ent.decode(htmlFromMarkdown)
    : htmlFromMarkdown
}

const markdownToPreactComponent = (markdown, {
  startBlock = defaultStartBlock,
  endBlock = defaultEndBlock,
  markedOptions = {}
} = {}) => {
  const htmlFromMarkdown = markdownToHtml(markdown, { markedOptions })
  const combinedHtml = `
      ${htmlFromMarkdown}`
  const tidiedHtml = tidy.tidy_html5(combinedHtml, {
    'output-xhtml': true,
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
  outputFolder,
  routes = './routes.json',
}) => {
  const markdown = fs.readFileSync(markdownFile, 'utf-8')
  const component = markdownToPreactComponent(markdown)
  const outputPath = resolve(join(outputFolder, `index.js`))
  console.log('writing: ', outputPath)
  fs.writeFileSync(outputPath, markdownToPreactComponent(markdown))
}

const indexJsTemplate =
`import { h } from 'preact'
import html from './data.html'
export default function () {
  return <div dangerouslySetInnerHtml={{__html: html}} />
}
`

const processFolderWithMarkdownFiles = ({ absoluteFolder, absoluteOutputFolder, slug, routesFile }) => {
  fs.mkdirSync(absoluteOutputFolder)
  fs.readdirSync(absoluteFolder).forEach(async nestedFile => {
    const nestedFilePath = join(absoluteFolder, nestedFile)
    if (extname(nestedFile) === '.md') {
      const html = markdownToHtml(fs.readFileSync(nestedFilePath, 'utf-8'), { markedOptions: { baseUrl: slug }})
      fs.writeFileSync(join(absoluteOutputFolder, 'data.html'), html)
      fs.writeFileSync(join(absoluteOutputFolder, 'index.js'), indexJsTemplate)
    } else {
      const dest = join(absoluteOutputFolder, nestedFile)
      console.log(`${nestedFilePath} -> ${dest}`)
      await copyFile(nestedFilePath, dest)
    }
  })
}

const markdownFoldersToComponents = (sourceFolder, outputFolder = './build', routesFile = './routes.json') => {
  assert(sourceFolder, 'First arg: folder with folders containing markdown files ')
  const folder = resolve(sourceFolder)
  assert(fs.existsSync(folder), `No such folder: ${folder}`)
  const absoluteOutputFolder = resolve(outputFolder)
  if (fs.existsSync(absoluteOutputFolder)) {
    rimraf.sync(absoluteOutputFolder)
  }
  if (!fs.existsSync(absoluteOutputFolder)) {
    fs.mkdirSync(absoluteOutputFolder)
  }
  fs.readdirSync(folder).forEach(file => {
    const filePath = join(folder, file)
    const stat = fs.statSync(filePath)
    const slug = basename(filePath)
    renderer.image = (href, title, text) => {
      return `<img src="/blog/${join(slug, href)}" alt="${title}" />`
    }
    if (stat.isDirectory() && basename(filePath) !== '.git') {
      const destFolder = join(absoluteOutputFolder, slug)
      processFolderWithMarkdownFiles({
        absoluteFolder: filePath,
        absoluteOutputFolder: destFolder,
        routesFile,
        slug
      })
    }
  })
}

async function copyFile(source, target) {
  var rd = fs.createReadStream(source);
  var wr = fs.createWriteStream(target);
  try {
    return await new Promise(function(resolve, reject) {
      rd.on('error', reject);
      wr.on('error', reject);
      wr.on('finish', resolve);
      rd.pipe(wr);
    });
  } catch (error) {
    rd.destroy();
    wr.end();
    throw error;
  }
}


export {
  markdownToPreactComponent,
  markdownFileToComponentFile,
  markdownFoldersToComponents,
}