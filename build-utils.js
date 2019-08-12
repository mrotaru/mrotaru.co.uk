const fs = require("fs").promises;
const marked = require("marked");
const handlebars = require("handlebars");
const ent = require("ent");
const tidy = require("tidy-html5");

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

const readFile = async (path, options) =>
  await fs.readFile(path, { encoding: "utf8", ...options });

const readJson = async file => {
  const stat = await estat(file);
  if (stat) {
    const json = await readFile(file);
    return JSON.parse(json);
  }
};

const compileTemplates = async () => {
  handlebars.registerPartial("head", await readFile("./templates/_head.html"));
  handlebars.registerPartial("footer", await readFile("./templates/_footer.html"));
  return {
    "page": handlebars.compile(await readFile("./templates/page.html")),
    "blog-post": handlebars.compile(await readFile("./templates/blog-post.html")),
    "folder-index": handlebars.compile(await readFile("./templates/folder-index.html")),
  };
};

const markdownToHtml = (markdownText, { markedOptions = {} } = {}) => {
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
  marked.setOptions(Object.assign({ xhtml: true }, markedOptions));
  const renderer = new marked.Renderer();
  const htmlFromMarkdown = marked(markdownText, { renderer });
  const withDecodeHtmlEntities = ent.decode(htmlFromMarkdown);
  const tidiedHtml = tidy.tidy_html5(withDecodeHtmlEntities, tidyOptions);
  return tidiedHtml;
};

exports.utils = {
  readFile,
  readJson,
  compileTemplates,
  estat,
  markdownToHtml
};
