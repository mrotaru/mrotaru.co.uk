import { resolve } from 'path'

export default (config, env, helpers) => {
  let html = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0]
  if (html) {
    html.plugin.options.template = `!!ejs-loader!${resolve('./src/template.html')}`
    html.plugin.options.title = 'Mihai Rotaru | Full-stack JavaScript developer'
  }
};