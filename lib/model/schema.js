'use strict';
const Schema = require('mongoose').Schema;

// 代码
const codeSchema = new Schema({
  code: { type: String, required: true, maxLength: 64 },
  name: String,
}, { _id: false });

// 密码
const secretSchema = new Schema({
  // 加密类型：plain、hash、encrypt等
  mech: { type: String, required: true, maxLength: 64, default: 'plain' },
  // 密码值
  secret: { type: String, required: true, maxLength: 128 },
}, { _id: false, timestamps: true, select: false });


module.exports = {
  NullableString: len => ({ type: String, maxLength: len }),
  RequiredString: len => ({ type: String, required: true, maxLength: len }),
  CodeNamePair: codeSchema,
  Secret: secretSchema,
};
