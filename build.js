const utils = require("util");
const fs = require("fs").promises;
const { join, extname, basename, sep } = require("path");
const assert = require("assert");
const url = require("url");
const {
  readFile,
  readJson,
  compileTemplates,
  estat,
  markdownToHtml
} = require("./build-utils").utils;
const ncp = utils.promisify(require("ncp").ncp);
const rimraf = utils.promisify(require("rimraf"));

let indexedMetas = [];

const baseUrl = process.env.BASE_URL || "http://localhost:8080";
const buildDir = async ({
  source,
  destination,
  parent = "",
  removeIfExisting = true,
  createDestination = true,
  templates
}) => {
  if (basename(source) === '.git') {
    return;
  }
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

  for (const dir of dirs.filter(dir => dir !== "index")) {
    const indexedDir = join(source, dir);
    const meta = await readJson(join(indexedDir, "meta.json"));
    const path = indexedDir.split(sep).slice(1).join(sep);
    indexedMetas.push({ ...meta, path, url: url.resolve(baseUrl, path) });
  }

  let meta = {};
  if (files.includes("meta.json")) {
    const json = await readFile(join(source, "meta.json"));
    meta = { ...JSON.parse(json), index: indexedMetas };
  }

  for (const dirName of dirs) {
    const joinedSource = join(source, dirName);
    const joinedDestination = join(destination, dirName);
    if (dirName === "index") {
      await buildDir({
        source: joinedSource,
        destination,
        parent: join(parent, dirName),
        removeIfExisting: false,
        createDestination: false,
        templates
      });
    } else {
      await buildDir({
        source: joinedSource,
        destination: joinedDestination,
        parent: join(parent, dirName),
        templates
      });
    }
  }

  for (const fileName of files.filter(file => file !== "meta.json")) {
    const joined = join(source, fileName);
    const ext = extname(fileName);
    if (ext === ".md") {
      const parentBaseUrl = url.resolve(baseUrl, parent);
      const markdown = await readFile(joined);
      const markedOptions = { baseUrl: `${parentBaseUrl}/` };
      assert(templates.hasOwnProperty(meta.template), `No such template: ${meta.template} (${source}${sep}${fileName})`);
      const html = templates[meta.template]({
        content: markdownToHtml(markdown, { markedOptions }),
        meta
      });
      await fs.writeFile(
        join(destination, `${basename(fileName, ".md")}.html`),
        html,
        { encoding: "utf8" }
      );
    } else {
      await fs.copyFile(joined, join(destination, fileName));
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

const destination = "./build"

build({ source: "./content", destination })
  .then(() => fs.copyFile('./node_modules/highlight.js/styles/default.css', join(destination, 'code-style.css')))
  .then(() => console.log("done."))
  .catch(err => console.log("build error:", err));
