# mrotaru.co.uk

- this repo contains only code for building a static website, no actual content
- content folder is hardcoded as `../mrotaru.co.uk-data`

## Build System

1. compile all `handlebars` templates in `./templates`
2. remove destination directory (`./build`) if already existing
3. copy folder with static files to `./build`
4. invoke the main `build` function for the `./content` folder

## Main Loop

1. handle `removeIfExisting`/`createDestination` flags
2. put files and folder names into separate arrays (`files` and `dirs`)
3. each dir: if not `index`, read the `meta.json` file, add `path` and `url`, push to `indexedMetas`
4. each file: if `meta.json`, read and store it as the `meta` variable
5. each dir:
  1. build source and destination paths
  2. if `index`, recurse with destination being same as current destination
  3. else, recurse, and remove destination if existing
6. each file that is not `meta.json`:
  1. if markdown:
    1. build options object for `marked`, setting `baseUrl` on it
    2. build content html using `markdownToHtml`
    3. build final html by using a compiled template
  2. if not markdown, copy to destination folder