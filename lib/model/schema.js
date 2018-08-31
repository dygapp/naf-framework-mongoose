'use strict';

module.exports = {
  NullableString: len => ({ type: String, maxLength: len }),
  RequiredString: len => ({ type: String, required: true, maxLength: len }),
};
