'use strict';

module.exports = {
  ...require('./naf-service'),
  ...require('./crud-service'),
  ...require('axios-service'),
};
