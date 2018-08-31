import * as EggApplication from 'egg';
import * as mongoose from 'mongoose';

declare module 'egg' {

  type MongooseModels = {
    [key: string]: mongoose.Model<any>
  };

  type MongooseSingleton = {
    clients: Map<string, mongoose.Connection>,
    get (id: string) : mongoose.Connection
  };

  type MongooseConfig = {
    url: string,
    options?: mongoose.ConnectionOptions
  };

  // extend app
  interface Application {
    mongooseDB: mongoose.Connection | MongooseSingleton;
    mongoose: typeof mongoose;
    model: MongooseModels;
  }

  // extend context
  interface Context {
    model: MongooseModels;

    /**
     * compose from ctx.query and ctx.request.body
     */
    requestparam: any;

    /**
     * 租户ID，用于多租户系统
     */
    tenant: string;

    // 返回JSON结果
    json(errcode: number, errmsg: string, data: object);
    success(message: string, data: object);
    fail(errcode: number, errmsg: string, details: any);
    /**
     * same to success(message: string, data: object);
     */
    ok(message: string, data: object);
  }

  // extend your config
  interface EggAppConfig {
    mongoose: {
      url?: string,
      options?: mongoose.ConnectionOptions,
      client?: MongooseConfig,
      clients?: {
        [key: string]: MongooseConfig
      }
    };
  }

}

/**
 * NafContext is not a real class,
 * it's extending from {@link EggApplication.Context},
 */
export interface NafContext extends EggApplication.Context {
  /**
   * compose from ctx.query and ctx.request.body
   */
  requestparam: any;

  // 返回JSON结果
  json(errcode: number, errmsg: string, data: object);
  success(message: string, data: object);
  fail(errcode: number, errmsg: string, details: any);
  /**
   * same to success(message: string, data: object);
   */
  ok(message: string, data: object);
}

declare namespace Services {

  /**
   * NafService is a base service class that can be extended,
   * it's extending from {@link Service},
   */
  export class NafService {
    /**
     * 构造函数
     * @param ctx context对象 
     * @param name service名称
     */
    // constructor(ctx: Context, name: String);

    /**
     * 租户ID，用于多租户系统
     */
    tenant: string;

    /** 
     * 生成Id，sequence名用service的name
     */
    nextId(): Number;

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

}

export as namespace Naf;
