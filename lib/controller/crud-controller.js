'use strict';
/**
 * 基于meta描述数据生成Controller类
 * 按照描述信息将web请求中的数据提取出来，组织为service的调用参数
 * {Controller名字}.json
 * meta文件属性描述：
 * service 字符串或者对象，字符串表示服务方法名，默认与action同名；
 *         对象可包含name、func两个属性，func与使用字符串是含义相同，
 *         name表示服务名
 * parameters 请求参数描述，对象类型，可以包含属性为：'query'、 'params'、 'requestBody'、'options'，
 *            分别对应eggjs中的三个请求参数来源和可选参数类型
 * options 可选参数，对象类型，可以指定排序字段和一些常量参数值，具体内容格式随意，在服务中解析
 * params 路由参数，数组类型，从ctx.params中提取数据
 * requestBody 请求数据，数组类型，从ctx.request.body中提取数据
 * query 查询参数，数组类型'options'，从ctx.query中提取数据
 * 完整格式：
  "action": {
    "parameters": {
      "params": ["field1", "field2",...], // 可选
      "query": ["field1", "field2",...], // 可选
      "requestBody": ["field1", "field2",...], // 可选
      "options": { "ext1": "value1"}, // 可选
    },
    "service": "query", // 可选
    "options": { // 可选
      "sort": ["field1", "field2",...]
    }
  },
 * 简单格式：
 * 如果meta对象中没有parameters属性，则按简单格式处理，即整个meta的内容都作为parameters来处理
  "action": {
    "params": ["attr1", "attr2",...], // 可选
    "query": ["attr1", "attr2",...], // 可选
    "requestBody": ["attr1", "attr2",...], // 可选
    "options": { "ext1": "value1"}, // 可选
  },
* meta实例：
 {
  "create": {
    "requestBody": ["code","name","order"]
  },
  "delete": {
    "query": ["_id"]
  },
  "update": {
    "query": ["_id"],
    "requestBody": ["name","order"]
  },
  "list": {
    "parameters": {},
    "service": "query",
    "options": {
      "sort": ["order", "code"]
    }
  },
  "fetch": {
    "query": ["_id"]
    "service": {
      "name": "items",
      "func": "query"
    }
  }
}
* 服务接口：
* someService.someMethod(requestParams, requestBody, options)
* 服务参数：
* requestParams 请求参数，必须
* requestBody 请求数据，可选
* options 可选参数，可选
*/
const _ = require('lodash');
const is = require('is-type-of');
const { trimData } = require('naf-core').Util;

let MapOptions;
const MapParameters = (ctx, opts) => {
  const include = [ 'parameters', 'query', 'params', 'requestBody', 'options' ];
  opts = trimData({ ...opts }, null, include);
  return Object.keys(opts).map(key => {
    // 嵌套调用
    if (key === 'parameters') return MapParameters(ctx, opts[key]);
    if (key === 'options') return MapOptions(ctx, opts[key]);

    let data = ctx[key];
    if (key === 'requestBody') data = ctx.request.body;
    const names = opts[key];
    if (_.isArray(names)) {
      return names.reduce((p, c) => {
        p[c] = data[c];
        return p;
      }, {});
    }
    return data;
  }).reduce((p, c) => {
    if (c) {
      p = { ...c, ...p };
    }
    return p;
  }, {});
};
const MapRequestBody = (ctx, opts) => {
  if (_.isArray(opts)) {
    const data = ctx.request.body;
    return opts.reduce((p, c) => {
      p[c] = data[c];
      return p;
    }, {});
  }

  return MapParameters(ctx, opts) || {};
};
MapOptions = (ctx, opts) => {
  const exclude = [ 'parameters', 'query', 'params', 'requestBody' ];
  const _opts = trimData({ ...opts }, exclude) || {};
  const params = MapParameters(ctx, opts) || {};

  if (!_.isUndefined(params.skip) && !_.isNumber(params.skip)) params.skip = Number(params.skip);
  if (!_.isUndefined(params.limit) && !_.isNumber(params.limit)) params.limit = Number(params.limit);

  return { ...params, ..._opts };
};

const CrudController = (cls, meta) => {
  Object.keys(meta)
    .forEach(key => {
      // Do not override existing functions
      if (!cls.prototype[key]) {
        const { parameters, requestBody, options } = meta[key];
        cls.prototype[key] = async function() {
          const { ctx } = this;
          const requestParams = MapParameters(ctx, parameters || meta[key]) || {};
          const _requestBody = requestBody && MapRequestBody(ctx, requestBody);
          const _options = options && MapOptions(ctx, options);
          const serviceParams = [ requestParams ];
          if (requestBody) {
            serviceParams.push(_requestBody);
          }
          if (options) {
            serviceParams.push(_options);
          }

          let { service } = meta[key];
          // 修改service元数据的定义方式
          // const funcName = (_.isObject(service) && service.action) || (_.isString(service) && service) || key;
          // const provider = (_.isObject(service) && service.name && ctx.service[service.name]) || this.service;
          if (_.isString(service)) { // TODO: 解析service为对象
            const tokens = service.split('.');
            service = { action: tokens.pop() };
            if (tokens.length > 0) {
              service.name = tokens;
            }
          }
          const funcName = (_.isObject(service) && service.action) || key;
          const provider = (_.isObject(service) && service.name && _.get(ctx.service, service.name)) || this.service;

          const func = provider[funcName];
          if (!is.asyncFunction(func)) {
            throw new Error('not support');
          }
          const data = await func.call(this.service, ...serviceParams);
          let res = { data };
          // 统计数据总数，处理分页
          if (_options && _options.count) {
            const funcName = _.isString(_options.count) ? _options.count : 'count';
            const func = provider[funcName];
            if (!is.asyncFunction(func)) {
              throw new Error('not support count function');
            }
            const total = await func.call(this.service, ...serviceParams);
            res = { data, total };
          }
          this.ctx.ok(res);
        };
      }
    });
  return cls;
};

module.exports = CrudController;
