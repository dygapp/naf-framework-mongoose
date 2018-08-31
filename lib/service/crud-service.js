'use strict';

const { isString, isArray } = require('lodash');
const { isNullOrUndefined, trimData } = require('naf-core').Util;
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const { BusinessError, ErrorCode } = require('naf-core').Error;
const { NafService } = require('./naf-service');

class CrudService extends NafService {
  async create(data) {
    assert(data);
    // TODO:保存数据
    const res = await this._create(data);
    return res;
  }

  async update(filter, update, { projection } = {}) {
    assert(filter);
    assert(update);
    const { _id } = filter;
    if (_id) filter = { _id: ObjectID(_id) };
    // TODO:检查数据是否存在
    const entity = await this._findOne(filter);
    if (isNullOrUndefined(entity)) throw new BusinessError(ErrorCode.DATA_NOT_EXIST);

    // TODO: 修改数据
    entity.set(trimData(update));
    await entity.save();
    return await this._findOne(filter, projection);
  }

  async delete(filter) {
    assert(filter);
    const { _id } = filter;
    if (_id) filter = { _id: ObjectID(_id) };
    await this._remove(filter);
    return 'deleted';
  }

  async fetch(filter, { sort, desc, projection } = {}) {
    assert(filter);
    const { _id } = filter;
    if (_id) filter = { _id: ObjectID(_id) };

    // 处理排序
    if (sort && isString(sort)) {
      sort = { [sort]: desc ? -1 : 1 };
    } else if (sort && isArray(sort)) {
      sort = sort.map(f => ({ [f]: desc ? -1 : 1 }))
        .reduce((p, c) => ({ ...p, ...c }), {});
    }

    return await this._findOne(filter, projection);
  }

  async query(filter, { skip, limit, sort, desc, projection } = {}) {
    // 处理排序
    if (sort && isString(sort)) {
      sort = { [sort]: desc ? -1 : 1 };
    } else if (sort && isArray(sort)) {
      sort = sort.map(f => ({ [f]: desc ? -1 : 1 }))
        .reduce((p, c) => ({ ...p, ...c }), {});
    }

    const rs = await this._find(filter, projection, { skip, limit, sort });
    return rs;
  }

  async count(filter) {
    const res = await this._count(filter);
    return res;
  }
}

module.exports = CrudService;
