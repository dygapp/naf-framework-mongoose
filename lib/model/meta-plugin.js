'use strict';

module.exports = exports = function metaPlugin(schema/* , options*/) {
  schema.add({
    meta: {
      state: { type: Number, default: 0 }, // 数据状态: 0-正常；1-标记删除
      comment: String,
    } });
  schema.set('timestamps', { createdAt: 'meta.createdAt', updatedAt: 'meta.updatedAt' });
};
