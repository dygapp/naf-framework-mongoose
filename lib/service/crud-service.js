'use strict';

const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;
const util = require('core-util-is');
const { BusinessError, ErrorCode } = require('naf-core').Error;
const NafService = require('./naf-service');

class CrudService extends NafService {
  async create(data) {
    assert(data);
    // TODO:保存数据
    const res = await this._create(data);
    return res;
  }

  async update(id, update) {
    assert(id);
    assert(update);
    // TODO:检查数据是否存在
    const entity = await this._findOne({ _id: ObjectID(id) });
    if (util.isNullOrUndefined(entity)) throw new BusinessError(ErrorCode.DATA_NOT_EXIST);

    // TODO: 修改数据
    entity.set(update);
    await entity.save();
    return await this._findOne({ _id: ObjectID(id) });
  }

  async delete(id) {
    assert(id);
    await this._remove({ _id: ObjectID(id) });
    return 'deleted';
  }

  async fetch(id) {
    return await this._findOne({ _id: ObjectID(id) });
  }

  async query(params, query, skip, limit, order) {
    const rs = await this._find({}, null, { skip, limit, sort: order && { [order]: 1 } });
    return rs;
  }
}

module.exports = CrudService;
