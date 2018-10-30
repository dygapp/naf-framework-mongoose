'use strict';

const _ = require('lodash');
const TENANT_MODELS = Symbol('Context#models@tenant');

const _loadModel = (app, tenant) => {
  app.logger.info(`[multi-tenancy] Load tenant models for ${tenant}`);
  const model = {};
  _.forEach(app.model, (val, key) => {
    const modelName = `${val.modelName}@${tenant}`;
    const collName = `_${tenant}.${val.collection.name}`;
    const multiTenancy = val.schema.get('multi-tenancy');
    if (multiTenancy) {
      app.logger.debug(`[multi-tenancy] ${modelName} loaded`);
      model[key] = val.db.model(modelName, val.schema, collName);
    } else {
      app.logger.debug(`[multi-tenancy] skip ${val.modelName}, schema not enable multi-tenancy.`);
      model[key] = val;
    }
  });
  return model;
};

const multiTenancyPlugin = (schema, options = {}) => {
  const { defaultTenant = 'master' } = options;
  schema.add({
    _tenant: { type: String, default: defaultTenant, index: true },
  });

  schema.pre('save', async function() {
    this._tenant = schema.get('x-tenant');
  });

  const querys = [ 'count', 'countDocuments', 'find', 'findOne', 'findOneAndRemove', 'findOneAndUpdate', 'remove', 'deleteOne', 'deleteMany', 'update', 'updateOne', 'updateMany' ];
  querys.forEach(action => {
    schema.pre(action, async function() {
      this.where('_tenant').equals(schema.get('x-tenant'));
    });
  });
};

const loadModel2 = (app, tenant) => {
  app.logger.info(`[multi-tenancy] Load tenant models for ${tenant}`);
  const model = {};
  _.forEach(app.model, (val, key) => {
    const modelName = `${val.modelName}@${tenant}`;
    const collName = `${val.collection.name}`;
    const multiTenancy = val.schema.get('multi-tenancy');
    if (multiTenancy) {
      app.logger.debug(`[multi-tenancy] ${modelName} loaded`);
      const schema = val.schema.clone();
      schema.set('x-tenant', tenant);
      schema.plugin(multiTenancyPlugin, app.config.multiTenancy);
      model[key] = val.db.model(modelName, schema, collName);
    } else {
      app.logger.debug(`[multi-tenancy] skip ${val.modelName}, schema not enable multi-tenancy.`);
      model[key] = val;
    }
  });
  return model;
};


// this 就是 app 对象，在其中可以调用 app 上的其他方法，或访问属性
module.exports = {

  // 多租户系统中的model对象
  tenantModel(tenant) {
    const { defaultTenant: _defaultTenant } = this.config.multiTenancy || {};
    if (tenant /* && tenant !== _defaultTenant*/) {
      // 非默认租户，加载租户model
      if (!this[TENANT_MODELS]) {
        this[TENANT_MODELS] = [];
      }
      const models = this[TENANT_MODELS];
      if (!models[tenant]) {
        // 加载租户Model
        models[tenant] = loadModel2(this, tenant);
      }
      return models[tenant];
    }
    // 默认租户返回原始model对象
    return this.model;
  },
};
