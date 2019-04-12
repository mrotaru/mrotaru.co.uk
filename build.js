const utils = require("util");
const fs = require("fs").promises;
const marked = require("marked");
const handlebars = require("handlebars");
const ent = require("ent");
const tidy = require("tidy-html5");
const { normalize, join, resolve, extname, basename } = require("path");
const url = require("url");
const ncp = utils.promisify(require("ncp").ncp);
const rimraf = utils.promisify(require("rimraf"));

const readFile = async (path, options) => await fs.readFile(path, { encoding: "utf8", ...options })
const baseUrl = process.env.BASE_URL || "http://localhost:8080";
const tidyOptions = {
  "doctype": "omit",
  "error-file": "/dev/null",
  "indent-spaces": 2,
  "indent": "yes",
  "omit-optional-tags": false,
  "output-xhtml": true,
  "show-body-only": true,
  "show-info": false,
  "show-warnings": false,
  "tidy-mark": false,
  "wrap": 120
};

const compileTemplates = async () => {
  handlebars.registerPartial('head', await readFile('./templates/_head.html'))
  handlebars.registerPartial('footer', await readFile('./templates/_footer.html'))
  const r1= await fs.readFile("./templates/page.html")
  return {
    "page": handlebars.compile(await readFile("./templates/page.html")),
    "blog-post": handlebars.compile(await readFile("./templates/blog-post.html")),
  }
};

const markdownToHtml = (markdownText, { markedOptions = {} } = {}) => {
  marked.setOptions(Object.assign({ xhtml: true }, markedOptions));
  const renderer = new marked.Renderer();
  const htmlFromMarkdown = marked(markdownText, { renderer });
  const withDecodeHtmlEntities = ent.decode(htmlFromMarkdown);
  const tidiedHtml = tidy.tidy_html5(withDecodeHtmlEntities, tidyOptions);
  return tidiedHtml;
};

const estat = async path => {
  try {
    return await fs.lstat(path);
  } catch (err) {
    if (err.code === "ENOENT") {
      return null;
    } else {
      throw err;
    }
  }
};

const buildDir = async ({
  source,
  destination,
  parent = "",
  removeIfExisting = true,
  createDestination = true,
  templates
}) => {
  console.log(`buid: ${source} 🠆 ${destination} ...`);
  const entries = await fs.readdir(source);
  const stat = await estat(destination);
  if (stat) {
    if (stat.isDirectory() && removeIfExisting) {
      await rimraf(destination);
    }
  }
  if (!stat && createDestination) {
    await fs.mkdir(destination);
  }
  const dirs = [];
  const files = [];
  for (let entry of entries) {
    const stat = await fs.lstat(join(source, entry));
    stat.isDirectory() && dirs.push(entry);
    stat.isFile() && files.push(entry);
  }
  for (const entry of dirs) {
    const joinedSource = join(source, entry);
    const joinedDestination = join(destination, entry);
    if (entry === "index") {
      await buildDir({
        source: joinedSource,
        destination,
        parent: join(parent, entry),
        removeIfExisting: false,
        createDestination: false,
        templates
      });
    } else {
      await buildDir({
        source: joinedSource,
        destination: joinedDestination,
        parent: join(parent, entry),
        templates
      });
    }
  }
  let meta = {};
  if (files.includes("meta.json")) {
    const json = await readFile(join(source, "meta.json"))
    meta = JSON.parse(json);
  }
  for (const entry of files.filter(file => file !== "meta.json")) {
    const joined = join(source, entry);
    const ext = extname(entry);
    if (ext === ".md") {
      const parentBaseUrl = url.resolve(baseUrl, parent);
      const markdown = await readFile(joined);
      const markedOptions = { baseUrl: `${parentBaseUrl}/` };
      const html = templates[meta.template]({
        content: markdownToHtml(markdown, { markedOptions }),
        meta,
      });
      await fs.writeFile(
        join(destination, `${basename(entry, ".md")}.html`),
        html,
        { encoding: "utf8" }
      );
    } else {
      await fs.copyFile(joined, join(destination, entry));
    }
  }
};

const build = async ({ source, destination }) => {
  const templates = await compileTemplates();
  const stat = await estat(destination);
  if (stat) {
    if (stat.isDirectory()) {
      await rimraf(destination);
    }
  }
  await ncp("./static", destination);
  await buildDir({
    source,
    destination,
    templates,
    removeIfExisting: false
  }).catch(err => console.log(`build dir ${source} failed:`, err));
};

build({ source: "./content", destination: "./build" })
  .then(res => console.log("done."))
  .catch(err => console.log("build error:", err));
