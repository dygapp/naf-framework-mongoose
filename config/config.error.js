'use strict';

const { NafError, BusinessError } = require('naf-core').Error;

module.exports = {
  json(err, ctx) {
    // json hander
    if (err instanceof BusinessError) {
      // 业务错误
      ctx.body = { errcode: err.errcode, errmsg: err.errmsg };
      ctx.status = 200;
    } else if (err instanceof NafError) {
      // 框架错误
      ctx.body = { errcode: err.errcode, errmsg: err.errmsg };
      ctx.status = 500;
    } else if (err instanceof Error) {
      // 其他错误
      ctx.body = { errcode: 500, errmsg: '系统错误', details: err.message };
      ctx.status = 500;
    } else {
      // 未知错误
      ctx.body = { errcode: 500, errmsg: '未知错误', details: err };
      ctx.status = 500;
    }
  },
};
