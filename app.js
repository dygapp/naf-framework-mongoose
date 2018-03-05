'use strict';

module.exports = app => {
  // 处理请求中抛出的MongoError错误类型，按正常http请求响应业务错误消息
  app.config.coreMiddleware.unshift('errorHandler', 'errorMongo');
};
