'use strict';

const is = require('is-type-of');
const { isString } = require('util');
const { ErrorCode } = require('naf-core').Error;

// this 就是 ctx 对象，在其中可以调用 ctx 上的其他方法，或访问属性
module.exports = {
  get requestparam() {
    return { ...this.query, ...this.request.body };
  },

  // 返回JSON结果
  json(errcode = 0, errmsg = 'ok', data = {}) {
    if (is.object(errmsg)) {
      data = errmsg;
      errmsg = 'ok';
    }
    this.body = { errcode, errmsg, ...data };
  },
  success(message = 'ok', data = {}) {
    this.json(0, message, data);
  },
  fail(errcode, errmsg, details) {
    if (isString(errcode)) {
      this.json(ErrorCode.BUSINESS, errcode, errmsg);
    } else {
      this.json(errcode, errmsg, { details });
    }
  },
  ok(message, data) {
    this.success(message, data);
  },

};
