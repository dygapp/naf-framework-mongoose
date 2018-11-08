'use strict';

const TENANT = Symbol('Context#tenant');
const TENANT_MODEL = Symbol('Context#model@tenant');
const TENANT_USERID = Symbol('Context#userid@tenant');
const TENANT_ROLE = Symbol('Context#role@tenant');
const TENANT_TAGS = Symbol('Context#tags@tenant');

// this 就是 ctx 对象，在其中可以调用 ctx 上的其他方法，或访问属性
module.exports = {
  // 多租户系统中的当前租户信息(multi-tenancy)
  get tenant() {
    const { defaultTenant } = this.app.config.multiTenancy || {};
    if (!this[TENANT]) {
      // 从 header或请求参数中获取，否则使用默认值。实际情况可能更复杂，需要从登录用户中获取该信息
      this[TENANT] = this.query._tenant || this.get('x-tenant') || defaultTenant;
    }
    return this[TENANT];
  },

  set tenant(value) {
    this[TENANT] = value;
  },

  // 多租户系统中的当前租户信息(multi-tenancy)
  get model() {
    const { defaultTenant: _defaultTenant } = this.app.config.multiTenancy || {};
    if (this.tenant /* && this.tenant !== defaultTenant */) {
      if (!this[TENANT_MODEL]) {
        // 从 header或请求参数中获取，否则使用默认值。实际情况可能更复杂，需要从登录用户中获取该信息
        this[TENANT_MODEL] = this.app.tenantModel(this.tenant);
      }
      return this[TENANT_MODEL];
    }
    return this.app.model;
  },

  // 当前用户相关信息
  get userid() {
    if (!this[TENANT_USERID]) {
      this[TENANT_USERID] = this.get('x-userid');
    }
    return this[TENANT_USERID];
  },
  get role() {
    if (!this[TENANT_ROLE]) {
      this[TENANT_ROLE] = this.get('x-role');
    }
    return this[TENANT_ROLE];
  },
  get tags() {
    if (!this[TENANT_TAGS]) {
      this[TENANT_TAGS] = this.get('x-tags');
    }
    return this[TENANT_TAGS];
  },
};
