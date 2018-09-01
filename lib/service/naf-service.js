'use strict';

const Service = require('egg').Service;

class NafService extends Service {
  constructor(ctx, name) {
    super(ctx);
    this.name = name;
  }
  get tenant() {
    return this.ctx.tenant;
  }
  async nextId(seqName) {
    const { seq } = this.ctx.service;
    const value = await seq.nextVal(seqName || this.name);
    return value;
  }
}

module.exports.NafService = NafService;
