const { join, relative } = require('path')

const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')

const workspaceRoot = join(__dirname, '../../..')

module.exports = {
  output: {
    path: join(__dirname, '../../../dist/api/main'),
    devtoolModuleFilenameTemplate: (info) => {
      // ref: https://webpack.js.org/configuration/output/#outputdevtoolmodulefilenametemplate
      // ref: https://github.com/nrwl/nx/issues/14708#issuecomment-2078810253
      const rel = relative(workspaceRoot, info.absoluteResourcePath)
      return `webpack:///./${rel}`
    },
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      sourceMap: true,
      optimization: true,
      outputHashing: 'none',
      watch: true,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
}
