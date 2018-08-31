'use strict';

const assert = require('assert');
const Service = require('egg').Service;


class SequenceService extends Service {
  async nextval(name) {
    const { ctx } = this;
    assert(ctx.model.Seq, 'Model Seq not found!');
    assert(name, 'seq name must not empty!');

    const _id = (ctx.tenant && `${ctx.tenant}_${name}`) || name;
    const { value } = await ctx.model.Seq.findByIdAndUpdate(_id,
      { $inc: { value: 1 } },
      { new: true, upsert: true }).exec();
    return value;
  }
}

module.exports = SequenceService;
