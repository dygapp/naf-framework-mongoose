'use strict';

const path = require('path');
const naf = require('naf-framework');
const EGG_PATH = Symbol.for('egg#eggPath');

class Application extends naf.Application {
  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }
}

class Agent extends naf.Agent {
  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }
}

module.exports = Object.assign(naf, {
  Application,
  Agent,
});
