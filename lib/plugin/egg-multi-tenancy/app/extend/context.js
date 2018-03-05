'use strict';

const TENANT = Symbol('Context#tenant');

// this 就是 ctx 对象，在其中可以调用 ctx 上的其他方法，或访问属性
module.exports = {
  // 多租户系统中的当前租户信息(multi-tenancy)
  get tenant() {
    const { defaultTenant } = this.app.config.multiTenancy || {};
    if (!this[TENANT]) {
      // 从 header或请求参数中获取，否则使用默认值。实际情况可能更复杂，需要从登录用户中获取该信息
      this[TENANT] = this.get('x-tenant') || this.query.tenant || defaultTenant;
    }
    return this[TENANT];
  },
};
