'use strict';

const { isString, isArray } = require('lodash');
const { isNullOrUndefined, trimData } = require('naf-core').Util;
const assert = require('assert');
const { ObjectId } = require('mongoose').Types;
const { BusinessError, ErrorCode } = require('naf-core').Error;
const { NafService } = require('./naf-service');

class CrudService extends NafService {
  async create(data) {
    assert(data);
    // TODO:保存数据
    const res = await this.model.create(data);
    return res;
  }

  async update(filter, update, { projection } = {}) {
    assert(filter);
    assert(update);
    const { _id } = filter;
    if (_id) filter = { _id: ObjectId(_id) };
    // TODO:检查数据是否存在
    const entity = await this.model.findOne(filter).exec();
    if (isNullOrUndefined(entity)) throw new BusinessError(ErrorCode.DATA_NOT_EXIST);

    // TODO: 修改数据
    entity.set(trimData(update));
    await entity.save();
    return await this.model.findOne(filter, projection).exec();
  }

  async delete(filter) {
    assert(filter);
    const { _id } = filter;
    if (_id) filter = { _id: ObjectId(_id) };
    await this.model.deleteOne(filter).exec();
    return 'deleted';
  }

  async fetch(filter, { sort, desc, projection } = {}) {
    assert(filter);
    const { _id } = filter;
    if (_id) filter = { _id: ObjectId(_id) };

    // 处理排序
    if (sort && isString(sort)) {
      sort = { [sort]: desc ? -1 : 1 };
    } else if (sort && isArray(sort)) {
      sort = sort.map(f => ({ [f]: desc ? -1 : 1 }))
        .reduce((p, c) => ({ ...p, ...c }), {});
    }

    return await this.model.findOne(filter, projection).exec();
  }

  async query(filter, { skip, limit, sort, desc, projection } = {}) {
    // 处理排序
    if (sort && isString(sort)) {
      sort = { [sort]: desc ? -1 : 1 };
    } else if (sort && isArray(sort)) {
      sort = sort.map(f => ({ [f]: desc ? -1 : 1 }))
        .reduce((p, c) => ({ ...p, ...c }), {});
    }

    const rs = await this.model.find(trimData(filter), projection, { skip, limit, sort }).exec();
    return rs;
  }

  async count(filter) {
    const res = await this.model.count(trimData(filter)).exec();
    return res;
  }

  async queryAndCount(filter, options) {
    const total = await this.count(filter);
    if (total === 0) return { total, data: [] };
    const rs = await this.query(filter, options);
    return { total, data: rs };
  }

}

module.exports.CrudService = CrudService;
