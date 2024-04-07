const { ValidationError } = require('../errors')
const { validate } = require('../validator')

class Fact {
  get id () {
    return undefined
  }

  get name () {
    return undefined
  }

  get description () {
    return undefined
  }

  get schema () {
    return {}
  }

  value (params = {}) {
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
