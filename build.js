const fs = require("fs").promises;
const marked = require("marked");
const handlebars = require("handlebars");
const ent = require("ent");
const tidy = require("tidy-html5");
const { normalize, join, resolve, extname, basename } = require("path");
const url = require("url");
const rimraf = require("rimraf");

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
  "wrap": 120,
};

const markdownToHtml = (markdownText, { markedOptions = {} } = {}) => {
  console.log(markedOptions);
  marked.setOptions(Object.assign({ xhtml: true }, markedOptions));
  const renderer = new marked.Renderer();
  const htmlFromMarkdown = marked(markdownText, { renderer });
  const withDecodeHtmlEntities = ent.decode(htmlFromMarkdown);
  const tidiedHtml = tidy.tidy_html5(withDecodeHtmlEntities, tidyOptions);
  return tidiedHtml;
};

const buildDir = async ({ source, destination, parent = "", removeIfExisting = true }) => {
  const entries = await fs.readdir(source);
  try {
    const stat = await fs.lstat(destination);
    if (stat.isDirectory() && removeIfExisting) {
      console.log(`${destination} exists, removing and re-creating...`);
      rimraf.sync(destination);
    }
  } catch (err) {}
  await fs.mkdir(destination);
  entries.forEach(async entry => {
    const joined = join(source, entry);
    const joinedDestination = join(destination, entry);
    const absolute = resolve(joined);
    const stat = await fs.lstat(joined);
    if (stat.isDirectory()) {
      // TODO: if 'index', destination = ${source}/index.html, removeIfExisting = false
      // TODO: if no md file in 'index' folder, build a page with links to other pages in same folder
      await buildDir({
        source: joined,
        destination: joinedDestination,
        parent: join(parent, entry)
      });
    } else if (stat.isFile()) {
      // 1. build html fragment from markdown
      // 2. TODO: copy static resources
      // 3. TODO: build html based on template and meta.json
      const ext = extname(entry);
      if (ext === ".md") {
        const parentBaseUrl = url.resolve(baseUrl, parent);
        console.log(entry, parent, parentBaseUrl);
        const markdown = await fs.readFile(joined, { encoding: "utf8" });
        const html = markdownToHtml(markdown, {
          markedOptions: { baseUrl: `${parentBaseUrl}/` }
        });
        await fs.writeFile(
          join(destination, `${basename(entry, ".md")}.html`),
          html,
          { encoding: "utf8" }
        );
      }
      if (entry === "meta.json") {
        // console.log(require(absolute));
      }
    }
  });
};

const build = async ({ source, destination }) => {
  const templateString = await fs.readFile("./template.html", {
    encoding: "utf8"
  });
  const template = handlebars.compile(templateString);
  await buildDir({ source, destination });
};

build({ source: "./content", destination: "./build" });
