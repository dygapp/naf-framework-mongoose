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

