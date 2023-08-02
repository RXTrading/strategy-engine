const _ = require('lodash')

const { ValidationError } = require('../errors')
const { validate } = require('../validator')

class Fact {
  get id () {
    return undefined
  }

  get schema () {
    return {}
  }

  value (originalParams = {}) {
    const params = _.cloneDeep(originalParams)
    this.#validateAndSanitize(params)

    return params
  }

  #validateAndSanitize (params = {}) {
    const valid = validate(params, this.schema)

    if (valid !== true) {
      throw new ValidationError(null, null, valid)
    }
  }
}

module.exports = Fact
