'use strict';

const Service = require('egg').Service;

class SequenceService extends Service {
  async nextval(name) {
    const { ctx } = this;
    const _id = `${ctx.tenant}_${name}`;
    const { value } = await ctx.model.Seq.findByIdAndUpdate(_id,
      { $inc: { value: 1 } },
      { new: true, upsert: true }).exec();
    return value;
  }
}

module.exports = SequenceService;
