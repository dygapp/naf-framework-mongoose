'use strict';

const { AssertionError } = require('assert');
const { BusinessError, ErrorCode } = require('naf-core').Error;


module.exports = options => {
  return async function(ctx, next) {
    try {
      await next();
    } catch (err) {
      if (err instanceof BusinessError && ctx.acceptJSON) {
        // 业务错误
        if (options.details) {
          ctx.body = { errcode: err.errcode, errmsg: err.errmsg, details: err.details };
        } else {
          ctx.body = { errcode: err.errcode, errmsg: err.errmsg };
        }
        ctx.status = 200;
        ctx.logger.warn(`BusinessError: ${err.errcode}, ${err.errmsg}`);
        ctx.logger.debug(err);
      } else if (err instanceof AssertionError && ctx.acceptJSON) {
        // Assert错误
        const errcode = ErrorCode.BADPARAM;
        if (options.details) {
          ctx.body = { errcode, errmsg: BusinessError.getErrorMsg(errcode), details: err.message };
        } else {
          ctx.body = { errcode, errmsg: BusinessError.getErrorMsg(errcode) };
        }
        ctx.status = 200;
        ctx.logger.warn(`AssertionError: ${err.message}`);
        ctx.logger.debug(err);
      } else {
        throw err;
      }
    }
  };
};
