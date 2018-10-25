'use strict';

const URI = require('urijs');
const qs = require('qs');

const uri = '/weixin/api/fetch?id=123&corp=345';
const parsed = URI.parse(uri);
console.log(parsed);
console.log(URI.parseQuery(parsed.query));
console.log(URI.parseQuery(''));

console.log(qs.parse(uri));
const query = console.log(qs.stringify({}));
if (query) {
  console.log('true');
} else {
  console.log(false);
}
