'use strict';

module.exports = require('./lib/framework.js');
module.exports.service = require('./lib/service');
module.exports.controller = require('./lib/controller');

/**
 * @member Naf#NafService
 * @since 0.0.1
 */
exports.NafService = require('./lib/service').NafService;

/**
 * @member Naf#CrudService
 * @since 0.0.1
 */
exports.CrudService = require('./lib/service').CrudService;
