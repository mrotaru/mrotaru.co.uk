import fs from 'fs'
import marked from 'marked'
import { normalize, join, resolve, extname, basename } from 'path'
import ent from 'ent'
import tidy from 'tidy-html5'
import cheerio from 'cheerio'
import assert from 'assert'

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
  marked.setOptions({ xhtml: true })
  const htmlFromMarkdown = ent.decode(marked(markdown))
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

const processFolderWithMarkdownFiles = (absoluteFolder, absoluteOutputFolder, routesFile) => {
  fs.mkdirSync(absoluteOutputFolder)
  fs.readdirSync(absoluteFolder).forEach(async nestedFile => {
    const nestedFilePath = join(absoluteFolder, nestedFile)
    if (extname(nestedFile) === '.md') {
      markdownFileToComponentFile(nestedFilePath, {
        outputFolder: absoluteOutputFolder,
        routes: routesFile,
      })
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
  if (!fs.existsSync(absoluteOutputFolder)) {
    fs.mkdirSync(absoluteOutputFolder)
  }
  fs.readdirSync(folder).forEach(file => {
    const filePath = join(folder, file)
    const stat = fs.statSync(filePath)
    const slug = basename(filePath)
    if (stat.isDirectory()) {
      const destFolder = join(absoluteOutputFolder, slug)
      processFolderWithMarkdownFiles(filePath, destFolder, routesFile)
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