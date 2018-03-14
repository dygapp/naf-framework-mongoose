'use strict';

const assert = require('assert');
const Service = require('egg').Service;
const ObjectId = require('mongodb').ObjectId;
const { trimData, isString } = require('naf-core').Util;

class NafModel {
  constructor(ctx, model) {
    assert(ctx);
    assert(model);
    this.ctx = ctx;
    this.model = model;
    this.tenant = ctx.tenant;
  }
  async _create(data) {
    assert(data);
    return await this.model.create({ ...data, tenant: this.tenant });
  }
  async _findById(_id) {
    if (isString(_id)) _id = ObjectId(_id);
    return await this.model.findById(_id).exec();
  }
  async _find(conditions = {}, projection, options) {
    if (conditions && conditions._id && isString(conditions._id)) conditions._id = ObjectId(conditions._id);
    conditions.tenant = this.tenant;
    return await this.model.find(trimData(conditions), trimData(projection), trimData(options)).exec();
  }
  async _findOne(conditions = {}, projection, options) {
    if (conditions && conditions._id && isString(conditions._id)) conditions._id = ObjectId(conditions._id);
    conditions.tenant = this.tenant;
    return await this.model.findOne(trimData(conditions), trimData(projection), trimData(options)).exec();
  }
  async _remove(conditions = {}) {
    if (conditions && conditions._id && isString(conditions._id)) conditions._id = ObjectId(conditions._id);
    conditions.tenant = this.tenant;
    return await this.model.remove(trimData(conditions)).exec();
  }
  async _findOneAndUpdate(conditions, update, options = { new: true }) {
    if (conditions && conditions._id && isString(conditions._id)) conditions._id = ObjectId(conditions._id);
    conditions.tenant = this.tenant;
    return await this.model.findOneAndUpdate(trimData(conditions), { $set: trimData(update) }, trimData(options)).exec();
  }
  async _findByIdAndUpdate(_id, update, options = { new: true }) {
    if (isString(_id)) _id = ObjectId(_id);
    return await this.model.findByIdAndUpdate(_id, { $set: trimData(update) }, trimData(options)).exec();
  }
  async _update(conditions, update, options) {
    if (conditions && conditions._id && isString(conditions._id)) conditions._id = ObjectId(conditions._id);
    conditions.tenant = this.tenant;
    return await this.model.update(trimData(conditions), { $set: trimData(update) }, trimData(options)).exec();
  }
  async _count(conditions) {
    conditions.tenant = this.tenant;
    return await this.model.count(trimData(conditions)).exec();
  }
}
class NafService extends Service {
  // constructor(ctx, name) {
  //   assert(name);
  //   super(ctx);
  //   this.seqName = name;
  // }
  get tenant() {
    return this.ctx.tenant;
  }
  // async nextId() {
  //   const { seq } = this.ctx.service;
  //   const value = await seq.nextVal(this.seqName);
  //   return value;
  // }
  async _create(data, model) {
    assert(data);
    model = model || this.model;
    return await model.create({ ...data, tenant: this.tenant });
  }
  async _findById(_id, model) {
    if (isString(_id)) _id = ObjectId(_id);
    model = model || this.model;
    return await model.findById(_id).exec();
  }
  async _find(conditions = {}, projection, options, model) {
    if (conditions && conditions._id && isString(conditions._id)) conditions._id = ObjectId(conditions._id);
    conditions.tenant = this.tenant;
    model = model || this.model;
    return await model.find(trimData(conditions), trimData(projection), trimData(options)).exec();
  }
  async _findOne(conditions = {}, projection, options, model) {
    if (conditions && conditions._id && isString(conditions._id)) conditions._id = ObjectId(conditions._id);
    conditions.tenant = this.tenant;
    model = model || this.model;
    return await model.findOne(trimData(conditions), trimData(projection), trimData(options)).exec();
  }
  async _remove(conditions = {}, model) {
    if (conditions && conditions._id && isString(conditions._id)) conditions._id = ObjectId(conditions._id);
    conditions.tenant = this.tenant;
    model = model || this.model;
    return await model.remove(trimData(conditions)).exec();
  }
  async _findOneAndUpdate(conditions, update, options = { new: true }, model) {
    if (conditions && conditions._id && isString(conditions._id)) conditions._id = ObjectId(conditions._id);
    conditions.tenant = this.tenant;
    model = model || this.model;
    return await model.findOneAndUpdate(trimData(conditions), { $set: trimData(update) }, trimData(options)).exec();
  }
  async _update(conditions, update, options, model) {
    if (conditions && conditions._id && isString(conditions._id)) conditions._id = ObjectId(conditions._id);
    conditions.tenant = this.tenant;
    model = model || this.model;
    return await model.update(trimData(conditions), { $set: trimData(update) }, trimData(options)).exec();
  }
  async _count(conditions, model) {
    conditions.tenant = this.tenant;
    model = model || this.model;
    return await model.count(trimData(conditions)).exec();
  }
  _trimData(data) {
    return trimData(data);
  }
  _model(model) {
    model = model || this.model;
    return new NafModel(this.ctx, model);
  }
}

module.exports = {
/**
 * @member Naf#NafService
 * @since 0.0.1
 */
  NafService,
  NafModel
};
