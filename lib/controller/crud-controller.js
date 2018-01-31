'use strict';

const is = require('is-type-of');
const { trimData } = require('naf-core').Util;

let MapOptions;
const MapParameters = (ctx, opts) => {
  const include = [ 'parameters', 'query', 'params', 'requestBody' ];
  opts = trimData({ ...opts }, null, include);
  return Object.keys(opts).map(key => {
    // 嵌套调用
    if (key === 'parameters') return MapParameters(ctx, opts[key]);
    if (key === 'options') return MapOptions(ctx, opts[key]);

    let data = ctx[key];
    if (key === 'requestBody') data = ctx.request.body;
    const names = opts[key];
    if (is.array(names)) {
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
  if (is.array(opts)) {
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

  return { ...params, ..._opts };
};

const CrudController = (cls, meta) => {
  Object.keys(meta)
    .forEach(key => {
      // Do not override existing functions
      if (!cls.prototype[key]) {
        const { service, parameters, requestBody, options } = meta[key];
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

          const func = this.service[service || key];
          if (!is.asyncFunction(func)) {
            throw new Error('not support');
          }
          const res = await func.call(this.service, ...serviceParams);
          this.ctx.ok({ data: res });
        };
      }
    });
  return cls;
};

module.exports = CrudController;
