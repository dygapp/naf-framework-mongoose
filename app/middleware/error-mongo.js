'use strict';

const { MongoError } = require('mongodb-core');
const { BusinessError, ErrorCode } = require('naf-core').Error;

// mongodb错误处理
const handleMongoError = (ctx, err, options) => {
  let errcode = ErrorCode.DATABASE;
  if (err.code === 11000) {
    errcode = ErrorCode.DATA_EXISTED;
  }

  if (options.details) {
    // expose details
    ctx.body = { errcode, errmsg: BusinessError.getErrorMsg(errcode), details: err.message };
  } else {
    ctx.body = { errcode, errmsg: BusinessError.getErrorMsg(errcode) };
  }
  ctx.status = 200;
  ctx.logger.warn(`MongoError: ${err.code}, ${err.message}`);
  ctx.logger.debug(err);
};

module.exports = (options = {}) => {
  return async function(ctx, next) {
    try {
      await next();
    } catch (err) {
      if (err instanceof MongoError && ctx.acceptJSON) {
        // 数据库错误
        handleMongoError(ctx, err, options);
      } else {
        throw err;
      }
    }
  };
};
