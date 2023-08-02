const _ = require('lodash')

const { ValidationError } = require('../errors')
const { validate } = require('../validator')

class Model {
  constructor (props = {}) {
    props = _.cloneDeep(props)

    this.set(props)
  }

  set (props = {}) {
    props = _.merge(this, props)

    this.#validateAndSanitize(props, this.constructor.schema)
    this.#setPropsFromSchema(props, this.constructor.schema)
  }

  static get schema () {
    return {}
  }

  #setPropsFromSchema (props, schema) {
    for (const key in schema) {
      this[key] = props[key]
    }
  }

  #validateAndSanitize (params, schema) {
    const valid = validate(params, schema)

    if (valid !== true) {
      throw new ValidationError(null, null, valid)
    }
  }
}

module.exports = Model
