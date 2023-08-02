const Model = require('./base')

class Operator extends Model {
  static get schema () {
    return {
      id: { type: 'string', required: true },
      evaluate: { type: 'function', required: true }
    }
  }
}

module.exports = Operator
