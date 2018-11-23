'use strict';

const assert = require('assert');
const _ = require('lodash');
const { BusinessError, ErrorCode } = require('naf-core').Error;
const { trimData, isNullOrUndefined } = require('naf-core').Util;
const { NafService } = require('./naf-service');
const axios = require('axios');


/**
 * meta 格式
 * {
 *  "baseUrl": "可选",
 *  "uri": "接口地址",
 *  "method": "GET or POST"，如果为空根据接口data参数推断
 * }
 *
 * 接口参数定义
 * api(query, data)
 * query - 查询参数对象
 * data - POST data
 */

class AxiosService extends NafService {
  constructor(ctx, meta, { baseUrl = '' }) {
    super(ctx);
    assert(_.isObject(meta));

    this.baseUrl = baseUrl;

    _.forEach(meta, (val, key) => {
      const { method, uri = key, baseUrl: _baseUrl } = val;
      this[key] = async (query = {}, data, options) => {
        if (_.isUndefined(options) && _.toLower(method) === 'get') {
          // TODO: get 请求可以没有data参数，直接是query,options
          options = data;
          data = undefined;
        }
        if (_.isUndefined(options) && _.isUndefined(data) && _.toLower(method) === 'post') {
          // TODO: post 请求可以只有一个data
          if (AxiosService.isOpts(query)) {
            options = query;
          } else {
            data = query;
          }
          query = undefined;
        }
        options = AxiosService.mergeOpts(query, data, options);
        options = _.merge(trimData({ method, baseURL: _baseUrl }), options);
        return await this.request(uri, options);
      };
    });
  }

  static isOpts(data) {
    // TODO: 判断是否Options对象
    return _.isObject(data) &&
      (_.isString(data.baseURL) || _.isObject(data.params) || _.isObject(data.data));
  }
  // 替换uri中的参数变量
  static mergeOpts(query, data, options) {
    // TODO: 合并query、data和options
    if (query && _.isUndefined(data) && _.isUndefined(options)) { // 只有一个参数，作为options或者query
      options = AxiosService.isOpts(query) ? query : { };
    }
    options = options || {};
    options.params = trimData(_.merge(options.params, query));
    if (data) {
      options.data = trimData(data);
    }
    return options;
  }

  // 替换uri中的参数变量
  static merge(uri, query = {}) {
    if (!uri.includes(':')) {
      return uri;
    }
    const keys = [];
    const regexp = /\/:([a-z0-9_]+)/ig;
    let res;
    // eslint-disable-next-line no-cond-assign
    while ((res = regexp.exec(uri)) != null) {
      keys.push(res[1]);
    }
    keys.forEach(key => {
      if (!isNullOrUndefined(query[key])) {
        uri = uri.replace(`:${key}`, query[key]);
      }
    });
    return uri;
  }

  httpGet(uri, query = {}, options) {
    options = AxiosService.mergeOpts(query, null, options);
    options = _.merge(options, { method: 'get' });
    return this.request(uri, options);
  }

  httpPost(uri, query = {}, data, options) {
    options = AxiosService.mergeOpts(query, data, options);
    options = _.merge(options, { method: 'post' });
    return this.request(uri, options);
  }

  async request(uri, query, data, options) {
    // TODO: 合并query和options
    options = AxiosService.mergeOpts(query, data, options);
    // TODO: 处理租户信息
    if (!options.params._tenant) {
      options.params._tenant = this.ctx.tenant; // 租户信息
    }
    const url = AxiosService.merge(uri, options.params);
    try {
      let res = await axios({
        method: isNullOrUndefined(data) ? 'get' : 'post',
        url,
        baseURL: this.baseUrl, // 可以被options中的baseURL覆盖
        responseType: 'json',
        ...options,
      });
      if (res.status !== 200) {
        throw new BusinessError(ErrorCode.NETWORK, `Http Code: ${res.status}`, res.data);
      }
      res = res.data;
      const { errcode, errmsg, details } = res;
      if (errcode) {
        throw new BusinessError(errcode, errmsg, details);
      }
      res = _.omit(res, [ 'errcode', 'errmsg', 'details' ]);
      const keys = Object.keys(res);
      if (keys.length === 1 && keys.includes('data')) {
        res = res.data;
      }
      return res;
    } catch (err) {
      if (err instanceof BusinessError) {
        throw err;
      }

      let errmsg = '接口请求失败';
      if (err.response) {
        const { status } = err.response;
        if (status === 401) {
          errmsg += ': 用户认证失败';
        } else if (status === 403) {
          errmsg += ': 当前用户不允许执行该操作';
        } else if (status >= 300) {
          errmsg += `: 网络错误：HttpCode ${status}`;
        }
      }
      this.ctx.logger.error(`[AxiosWrapper] 接口请求失败: ${err.config && err.config.url} - ${err.message}`);
      if (err.response && err.response.data) {
        this.ctx.logger.debug('[AxiosService]', err.response.data);
      }
      throw new BusinessError(ErrorCode.SERVICE_FAULT, errmsg, err.message);
    }
  }

}

module.exports.AxiosService = AxiosService;
