'use strict';

const path = require('path');

// add you build-in plugin here, example:
// exports.nunjucks = {
//   enable: true,
//   package: 'egg-view-nunjucks',
// };

exports.multiTenancy = {
  enable: false,
  path: path.join(__dirname, '../lib/plugin/egg-multi-tenancy'),
};

exports.mongoose = {
  enable: true,
  package: 'egg-mongoose',
};

exports.validate = {
  enable: true,
  package: 'egg-validate',
};
