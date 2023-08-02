const Model = require('./base')

class Fact extends Model {
  static get schema () {
    return {
      id: { type: 'string', required: true },
      value: { type: 'any', required: true },
      options: {
        type: 'object',
        optional: true,
        default: {},
        props: {
          cache: { type: 'boolean', optional: true, default: true, convert: true },
          priority: { type: 'number', optional: true, min: 1, default: 1 }
        }
      }
    }
  }
}

module.exports = Fact
