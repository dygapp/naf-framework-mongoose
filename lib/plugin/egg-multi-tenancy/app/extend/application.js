'use strict';

const _ = require('lodash');
const TENANT_MODELS = Symbol('Context#models@tenant');

const loadModel = (app, tenant) => {
  app.logger.info(`[multi-tenancy] 加载租户${tenant}的Model对象`);
  const model = {};
  _.forEach(app.model, (val, key) => {
    const modelName = `${val.modelName}@${tenant}`;
    const collName = `${val.collection.name}@${tenant}`;
    app.logger.debug(`[multi-tenancy] Model - ${modelName}`);
    model[key] = val.db.model(modelName, val.schema, collName);
  });
  return model;
};

// this 就是 app 对象，在其中可以调用 app 上的其他方法，或访问属性
module.exports = {

  // 多租户系统中的model对象
  tenantModel(tenant) {
    const { defaultTenant } = this.config.multiTenancy || {};
    if (tenant && tenant !== defaultTenant) {
      // 非默认租户，加载租户model
      if (!this[TENANT_MODELS]) {
        this[TENANT_MODELS] = [];
      }
      const models = this[TENANT_MODELS];
      if (!models[tenant]) {
        // 加载租户Model
        models[tenant] = loadModel(this, tenant);
      }
      return models[tenant];
    }
    // 默认租户返回原始model对象
    return this.app.model;
  },
};
