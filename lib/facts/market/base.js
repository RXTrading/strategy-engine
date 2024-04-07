const Fact = require('../base')

class Base extends Fact {
  get id () {
    return 'market.base'
  }

  get name () {
    return 'Base symbol for market'
  }

  get description () {
    return 'Get the base symbol from a market symbol'
  }

  get schema () {
    return {
      market: { type: 'market', required: true, description: 'The market symbol.' },
      $$strict: 'remove'
    }
  }

  async value (params = {}) {
    params = super.value(params)

    return params.market.split('/')[0]
  }
}

module.exports = Base
