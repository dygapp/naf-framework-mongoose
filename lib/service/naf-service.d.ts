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
     * 服务名，用于默认序列名，可选
     */
    name: string;

    /**
     * 服务默认Model对象
     */
    model: mongoose.Model<any>;

    /** 
     * 生成Id，sequence名用service的name
     */
    nextId(seqName: string = null): Number;

  }
