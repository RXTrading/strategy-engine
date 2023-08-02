const _ = require('lodash')
const BigNumber = require('bignumber.js')
const techIndicators = require('technicalindicators')

const Fact = require('../base')

class EMA extends Fact {
  get id () {
    return 'ta.ema'
  }

  get schema () {
    return {
      values: { type: 'array', items: { type: 'number', convert: true }, optional: true, default: [] },
      period: { type: 'number', optional: true, default: 14, min: 1, convert: true },
      $$strict: 'remove'
    }
  }

  async value (params = {}) {
    params = super.value(params)

    const ema = techIndicators.EMA.calculate(params).map(ema => BigNumber(ema).toNumber())

    return _.takeRight(ema, params.period)
  }
}

module.exports = EMA
