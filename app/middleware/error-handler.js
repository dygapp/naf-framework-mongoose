'use strict';

const { AssertionError } = require('assert');
const { BusinessError, ErrorCode } = require('naf-core').Error;


module.exports = options => {
  return async function(ctx, next) {
    try {
      await next();
    } catch (err) {
      if (err instanceof BusinessError /* && ctx.acceptJSON */) {
        // 业务错误
        let res = { errcode: err.errcode, errmsg: err.errmsg };
        if (options.details) {
          res = { errcode: err.errcode, errmsg: err.errmsg, details: err.details };
        }
        ctx.body = res;
        ctx.status = 200;
        ctx.logger.warn(`BusinessError: ${err.errcode}, ${err.errmsg}`);
        ctx.logger.debug(err);
      } else if (err instanceof AssertionError /* && ctx.acceptJSON */) {
        // Assert错误
        const errcode = ErrorCode.BADPARAM;
        let res = { errcode, errmsg: BusinessError.getErrorMsg(errcode) };
        if (options.details) {
          res = { errcode, errmsg: BusinessError.getErrorMsg(errcode), details: err.message };
        }
        ctx.body = res;
        ctx.status = 200;
        ctx.logger.warn(`AssertionError: ${err.message}`);
        ctx.logger.debug(err);
      } else {
        throw err;
      }
    }
  };
};
