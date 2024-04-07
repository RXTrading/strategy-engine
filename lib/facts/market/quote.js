const Fact = require('../base')

class Quote extends Fact {
  get id () {
    return 'market.quote'
  }

  get name () {
    return 'Quote symbol for market'
  }

  get description () {
    return 'Get the quote symbol from a market symbol'
  }

  get schema () {
    return {
      market: { type: 'market', required: true, description: 'The market symbol.' },
      $$strict: 'remove'
    }
  }

  async value (params = {}) {
    params = super.value(params)

    return params.market.split('/')[1]
  }
}

module.exports = Quote
