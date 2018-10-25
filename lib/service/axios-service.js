'use strict';

const assert = require('assert');
const _ = require('lodash');
const { BusinessError, ErrorCode } = require('naf-core').Error;
const { trimData, isNullOrUndefined } = require('naf-core').Util;
const Service = require('egg').Service;
const axios = require('axios');
const URI = require('urijs');
const qs = require('qs');


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

class AxiosService extends Service {
  constructor(ctx, meta, { baseUrl = '' }) {
    super(ctx);
    assert(_.isObject(meta));

    this.baseUrl = baseUrl;

    _.forEach(meta, (val, key) => {
      const { method, uri, baseUrl: _baseUrl } = val;
      this[key] = async (query, data, options = {}) => {
        options = { ...trimData({ method, baseURL: _baseUrl }), ...options };
        return await this.request(uri, query, data, options);
      };
    });
  }

  // 合并uri和query
  merge(uri, query) {
    const parsed = URI.parse(uri);
    if (parsed.query) {
      query = { ...query, ...URI.parseQuery(parsed.query) };
      uri = parsed.path;
    }
    query = qs.stringify(query);
    if (query) {
      uri += '?' + query;
    }
    return uri;
  }

  async request(uri, query = {}, data, options = {}) {
    const url = this.merge(uri, query);
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
      this.ctx.logger.error(`[AxiosService] 接口请求失败: ${err.config.url} - ${err.message}`);
      if (err.response && err.response.data) {
        this.ctx.logger.debug('[AxiosService]', err.response.data);
      }
      throw new BusinessError(ErrorCode.SERVICE_FAULT, '接口请求失败', err.message);
    }
  }

}

module.exports.AxiosService = AxiosService;
