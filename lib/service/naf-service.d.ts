import * as Egg from 'egg';
import * as mongoose from 'mongoose';

  /**
   * NafService is a base service class that can be extended,
   * it's extending from {@link Service},
   */
  export class NafService extends Egg.Service {
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
     * 服务默认Model对象
     */
    model: mongoose.Model<any>;

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
