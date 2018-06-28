import { markdownFoldersToComponents } from './lib/build-blog-posts'
import path from 'path'
import assert from 'assert'

const [,, postsFolder, outFolder, routesFile ] = process.argv

markdownFoldersToComponents(postsFolder, outFolder, routesFile)