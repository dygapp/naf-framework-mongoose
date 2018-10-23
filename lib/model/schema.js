'use strict';
const Schema = require('mongoose').Schema;

// 代码
const codeSchema = new Schema({
  code: { type: String, required: true, maxLength: 64 },
  name: String,
}, { _id: false });

module.exports = {
  NullableString: len => ({ type: String, maxLength: len }),
  RequiredString: len => ({ type: String, required: true, maxLength: len }),
  CodeNamePair: codeSchema,
};
