import { Context } from "egg";

/**
 * NafService is a wrapper class for mongoose model
 */
declare class NafModel { // tslint:disable-line
  /**
   * 构造函数
   * @param ctx context对象 
   * @param model mongoose model对象
   */
  constructor(ctx: Context, model: any);

  /**
   * 原始的Mongoose model对象
   */
  model: any;

  /**
   * 插入数据
   * @param data 数据对象
   * @param model mongoose model对象 
   */
  _create(data: any);

  _findById(_id: any);

  _find(conditions: Object, projection: Object, options: Object);

  _findOne(conditions: Object, projection: Object, options: Object);

  _remove(conditions: Object);

  _findOneAndUpdate(conditions: Object, update: Object, options: Object);

  _findByIdAndUpdate(_id: any, update: Object, options: Object);

  _update(conditions: Object, update: Object, options: Object);

  _count(conditions: Object);

}

/**
 * NafService is a base service class that can be extended,
 * it's extending from {@link Service},
 */
export class NafService { // tslint:disable-line
  /**
   * 构造函数
   * @param ctx context对象 
   * @param name service名称
   */
  constructor(ctx: Context, name: String);

  /**
   * 租户ID，用于多租户系统
   */
  tenant: string;

  /** 
   * 生成Id，sequence名用service的name
   */
  nextId(): any;

  _model(model: any): NafModel;

  /**
   * 插入数据
   * @param data 数据对象
   * @param model mongoose model对象 
   */
  _create(data: Object, model: any);

  _findById(_id: string, model: any);

  _find(conditions: Object, projection: Object, options: Object, model: any);

  _findOne(conditions: Object, projection: Object, options: Object, model: any);

  _remove(conditions: Object, model: any);

  _findOneAndUpdate(conditions: Object, update: Object, options: Object, model: any);

  _update(conditions: Object, update: Object, options: Object, model: any);

  _count(conditions: Object, model: any);
}

/**
 * CrudService is extending from {@link NafService} ,
 */
export class CrudService extends NafService { }

export as namespace Naf;
