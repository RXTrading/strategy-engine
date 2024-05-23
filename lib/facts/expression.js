const jsonata = require('jsonata')

const Fact = require('./base')

class Expression extends Fact {
  get id () {
    return 'expression'
  }

  get name () {
    return 'Evaluate Expression'
  }

  get description () {
    return 'Evaluate an expression against provided paramters.'
  }

  get schema () {
    return {
      expression: { type: 'string', required: true, description: 'The expression.' },
      data: { type: 'object', optional: true, default: {}, description: 'The data to evaluate the expression against.' },
      $$strict: true
    }
  }

  async value (params = {}) {
    params = super.value(params)

    return jsonata(params.expression).evaluate(params.data)
  }
}

module.exports = Expression
