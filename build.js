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

const compileTemplates = async () => ({
  "page": handlebars.compile(await fs.readFile("./template-page.html", { encoding: "utf8" })),
  "blog-post": handlebars.compile(await fs.readFile("./template-blog-post.html", { encoding: "utf8" })),
})

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
  createDestination = true,
  templates,
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
        createDestination: false,
        templates,
      });
    } else {
      await buildDir({
        source: joinedSource,
        destination: joinedDestination,
        parent: join(parent, entry),
        templates,
      });
    }
  }
  let meta = {}
  if (files.includes("meta.json")) {
    const json = await fs.readFile(join(source, "meta.json"), { encoding: "utf8" });
    meta = JSON.parse(json)
  }
  for (const entry of files.filter(file => file !== "meta.json")) {
    const joined = join(source, entry);
    const ext = extname(entry);
    if (ext === ".md") {
      const parentBaseUrl = url.resolve(baseUrl, parent);
      const markdown = await fs.readFile(joined, { encoding: "utf8" });
      const markedOptions = { baseUrl: `${parentBaseUrl}/` }
      const html = templates[meta.template]({
        content: markdownToHtml(markdown, { markedOptions }),
        ...meta,
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
  const templates = await compileTemplates()
  console.log(templates)
  await buildDir({ source, destination, templates }).catch(err =>
    console.log(`build dir ${source} failed:`, err)
  );
};

build({ source: "./content", destination: "./build" })
  .then(res => console.log("done."))
  .catch(err => console.log("build error:", err));
