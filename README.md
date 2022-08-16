# file-watch-hmr

File Watch HMR webpack plugin allows watching for file changes during development on the client or server

## Requirements

- Node.js v10 or above
- Webpack 4.x - 5.x

## Installation

```sh
$ npm install --save-dev file-watch-hmr
```

## Usage

### Add Webpack plugin

Add the plugin to your Webpack config (or Next.js).

<!-- prettier-ignore-start -->

```js
// webpack.config.js
const { FileWatchHMRPlugin } = require('file-watch-hmr/plugin');

module.exports = {
  ...
  // Add the plugin to your Webpack configuration
  plugins: [
    new FileWatchHMRPlugin({
      // specific files can be watched
      files: [
        path.resolve(__dirname, 'app/locales/en/common.json'),
        // glob patterns are also supported
        path.resolve(__dirname, 'app/locales/**')
      ],
      // or whole directories (with all subfolders and files)
      folders: [
        path.resolve(__dirname, 'app/locales/en'),
        // even more complex folders with glob patterns
        path.resolve(__dirname, 'app/*/en'),
      ]
    })
  ]
};
```

### Callback on the client side

The lib then can trigger a callback on the client whenever a watched changes by using Webpack HMR:

<!-- prettier-ignore-start -->

```js
// Somewhere on your client
if (process.env.NODE_ENV === 'development') {
  const { applyClientHMR } = require('file-watch-hmr/client');
  applyClientHMR((changedFile) => {
    // changedFile is the abolute path of the file that changed
  });
}
```

### Callback on the server side

The lib then can trigger a callback on the server whenever a watched file changes:

```js
// Somewhere on the server
if (process.env.NODE_ENV === 'development') {
  const { applyServerHMR } = require('file-watch-hmr/server');
  applyServerHMR((changedFile) => {
    // changedFile is the abolute path of the file that changed
  });
}
```

⚠️ If your server side is bundled using Webpack, the lib will use the native HMR (if enabled). For it to work properly the lib must be **bundled**, therefore, you should specify the lib as not [external](https://webpack.js.org/configuration/externals/).

There are 2 ways to do that:

1. if you are using [webpack-node-externals](https://github.com/liady/webpack-node-externals) specify `file-watch-hmr` in the [`whitelist`](https://github.com/liady/webpack-node-externals#optionswhitelist-).
2. use a relative path to `node_modules`, something like:

<!-- prettier-ignore-start -->

```js
const { applyServerHMR } = require('../node_modules/file-watch-hmr/server');
```

## Example

A working example with Next.js can be found in the [`examples`](https://github.com/medihack/file-watch-hmr/tree/master/examples) folder.

## Attribution

This plugin is heavily inspired and code reused from ["i18next-hmr"](https://github.com/felixmosh/i18next-hmr) from [felixmosh](https://github.com/felixmosh). So all kudos to him.
