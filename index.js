'use strict';

module.exports = require('./lib/framework.js');
// module.exports.service = require('./lib/service');
module.exports.controller = require('./lib/controller');

module.exports.service = {
  ...require('./lib/service/naf-service'),
  /**
 * @member Naf#CrudService
 * @since 0.0.1
 */
  CrudService: require('./lib/service/crud-service'),
};
