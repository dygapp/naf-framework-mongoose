'use strict';
const { RequiredString } = require('./schema');

const SchemaDefine = {
  _id: RequiredString(64),
  value: Number,
};

module.exports = SchemaDefine;
