'use strict';

const ErrorConfig = require('./config.error.js');

module.exports = appInfo => {
  const config = {};

  /**
   * some description
   * @member Config#test
   * @property {String} key - some description
   */
  config.test = {
    key: appInfo.name + '_123456',
  };

  // 安全配置
  config.security = {
    csrf: {
      // ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
      enable: false,
    },
  };

  config.onerror = ErrorConfig;

  config.errorMongo = {
    details: true,
  };
  config.errorHandler = {
    details: true,
  };

  return config;
};
