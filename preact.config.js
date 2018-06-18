import { resolve } from 'path'

export default (config, env, helpers) => {
  for (let { plugin } of helpers.getPluginsByName(config, 'HtmlWebpackPlugin')) {
    plugin.options.template = `!!ejs-loader!${resolve('./src/template.html')}`
  }
};