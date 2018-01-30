# naf-framework-mongoose

naf egg framework use mongoose

## QuickStart

```bash
$ npm install
$ npm test
```

publish your framework to npm, then change app's dependencies:

```js
// {app_root}/index.js
require('naf-framework-mongoose').startCluster({
  baseDir: __dirname,
  // port: 7001, // default to 7001
});

```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

