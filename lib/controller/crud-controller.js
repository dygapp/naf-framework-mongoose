'use strict';

const Controller = require('egg').Controller;
const { CrudService } = require('../service');
const { trimData } = require('naf-core').Util;

class CrudController extends Controller {
  constructor(ctx) {
    super(ctx);
    this.service = new CrudService(ctx);
  }
  // POST
  async create() {
    const { ctx } = this;
    const res = await this.service.create(ctx.request.body);
    this.ok({ created: res });
  }
  // POST
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;
    await this.service.delete(id);
    this.ok();
  }
  // POST
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await this.service.update(id, ctx.request.body);
    this.ok(res);
  }
  // GET
  async fetch() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await this.service.fetch(id);
    this.ok({ data: res });
  }
  // GET
  async query() {
    const { ctx } = this;
    const { skip = 0, limit = 100, order } = ctx.query;
    this.service.query(ctx.params, this.trimQuery(), skip, limit, order);
  }
  trimQuery() {
    const exclude = [ 'skip', 'limit', 'order', 'access_token', 'timestamp' ];
    const res = { ...this.ctx.query };
    return trimData(res, exclude);
  }
}

module.exports = CrudController;
