'use strict';

module.exports = {
  ...require('./naf-service'),
  /**
 * @member Naf#CrudService
 * @since 0.0.1
 */
  CrudService: require('./crud-service'),
};
