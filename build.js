const fs = require("fs").promises;
const marked = require("marked");
const handlebars = require("handlebars");
const ent = require("ent");
const tidy = require("tidy-html5");
const { normalize, join, resolve, extname, basename } = require("path");
const url = require("url");
const utils = require("util");
const rimraf = utils.promisify(require("rimraf"));

const baseUrl = process.env.BASE_URL || "http://localhost:8080";
const tidyOptions = {
  doctype: "omit",
  "error-file": "/dev/null",
  "indent-spaces": 2,
  indent: "yes",
  "omit-optional-tags": false,
  "output-xhtml": true,
  "show-body-only": true,
  "show-info": false,
  "show-warnings": false,
  "tidy-mark": false,
  wrap: 120
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
    return err.code === "ENOENT" ? null : err;
  }
};

const buildDir = async ({
  source,
  destination,
  parent = "",
  removeIfExisting = true,
  createDestination = true
}) => {
  console.log(`buid: ${source} 🠆 ${destination} ...`);
  const entries = await fs.readdir(source);
  const stat = await estat(destination);
  if (stat) {
    if (stat.isDirectory() && removeIfExisting) {
      await rimraf(destination);
    }
  }
  if (createDestination) {
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
        createDestination: false
      });
    } else {
      // TODO: if no md file in 'index' folder, build a page with links to other pages in same folder
      await buildDir({
        source: joinedSource,
        destination: joinedDestination,
        parent: join(parent, entry)
      });
    }
  }
  for (const entry of files) {
    const joined = join(source, entry);
    const ext = extname(entry);
    if (ext === ".md") {
      const parentBaseUrl = url.resolve(baseUrl, parent);
      const markdown = await fs.readFile(joined, { encoding: "utf8" });
      const html = markdownToHtml(markdown, {
        markedOptions: { baseUrl: `${parentBaseUrl}/` }
      });
      await fs.writeFile(
        join(destination, `${basename(entry, ".md")}.html`),
        html,
        { encoding: "utf8" }
      );
    } else if (entry === "meta.json") {
      // console.log(require(absolute));
    } else {
      await fs.copyFile(joined, join(destination, entry));
    }
  }
};

const build = async ({ source, destination }) => {
  const templateString = await fs.readFile("./template.html", {
    encoding: "utf8"
  });
  const template = handlebars.compile(templateString);
  await buildDir({ source, destination }).catch(err =>
    console.log(`build dir ${source} failed:`, err)
  );
};

build({ source: "./content", destination: "./build" })
  .then(res => console.log("done."))
  .catch(err => console.log("build error:", err));
