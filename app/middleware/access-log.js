// app/middleware/gzip.js
'use strict';

module.exports = ({ enable = false, body = false }) => async function accessLog(ctx, next) {

  if (enable) {
    ctx.app.logger.debug(`[access-log] ${ctx.logger.paddingMessage} start...`);
    if (body && ctx.method !== 'GET') {
      ctx.app.logger.debug('[access-log] request body', ctx.request.body);
    }
  }

  await next();

  if (enable) {
    ctx.app.logger.info(`[access-log] ${ctx.logger.paddingMessage} ${ctx.response.status} ${ctx.response.message}`);
  }
  if (body && ctx.acceptJSON) {
    ctx.app.logger.debug('[access-log] response body', ctx.response && ctx.response.body);
  }
};
