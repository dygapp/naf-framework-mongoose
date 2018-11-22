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
      this[key] = async (data, query, options) => {
        if (_.isString(method) && method.toLowerCase() === 'get') {
          // TODO: get 请求没有data参数，直接是query,options
          options = query;
          query = data;
          data = null;
        }
        options = AxiosService.mergeOpts(query, options);
        options = { ...trimData({ method, baseURL: _baseUrl }), ...options };
        return await this.request(uri, data, options);
      };
    });
  }

  // 替换uri中的参数变量
  static mergeOpts(query, options) {
    // TODO: 合并query和options
    if (_.isObject(query) && _.isObject(options)) {
      options = { ...options, params: query };
    } else if (_.isObject(query) && !query.params) {
      options = { params: query };
    } else if (_.isObject(query) && query.params) {
      options = query;
    }
    if (options && options.params) options.params = trimData(options.params);
    return options || {};
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

  httpGet(uri, query, options) {
    return this.request(uri, null, query, options);
  }

  httpPost(uri, data = {}, query, options) {
    return this.request(uri, data, query, options);
  }

  async request(uri, data, query, options) {
    // TODO: 合并query和options
    options = AxiosService.mergeOpts(query, options);
    const url = AxiosService.merge(uri, options.params);
    try {
      let res = await axios({
        method: isNullOrUndefined(data) ? 'get' : 'post',
        url,
        data,
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
