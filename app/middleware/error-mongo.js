'use strict';

// const { MongoError } = require('mongodb-core');
const { ValidationError } = require('mongoose').Error;
const { BusinessError, ErrorCode } = require('naf-core').Error;

// mongodb错误处理
const handleMongoError = (ctx, err, options) => {
  let errcode = ErrorCode.DATABASE_FAULT;
  if (err.code === 11000) {
    errcode = ErrorCode.DATA_EXISTED;
  } /* else if (err instanceof ValidationError && ctx.acceptJSON) {
    // 数据库错误
    errcode = ErrorCode.BADPARAM;
  }*/


  let res = { errcode, errmsg: BusinessError.getErrorMsg(errcode) };
  if (options.details) {
    // expose details
    res = { errcode, errmsg: BusinessError.getErrorMsg(errcode), details: err.message };
  }
  if (ctx.acceptJSON) {
    ctx.body = res;
  } else {
    ctx.render('error.njk', res);
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
      if (err.name === 'MongoError' && ctx.acceptJSON) {
        // 数据库错误
        handleMongoError(ctx, err, options);
      } else if (err instanceof ValidationError && ctx.acceptJSON) {
        // 数据库错误
        handleMongoError(ctx, err, options);
      } else {
        throw err;
      }
    }
  };
};
