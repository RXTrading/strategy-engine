const _ = require('lodash')
const BigNumber = require('bignumber.js')
const techIndicators = require('technicalindicators')

const Fact = require('../base')

class RSI extends Fact {
  get id () {
    return 'ta.rsi'
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

    const rsi = techIndicators.RSI.calculate(params).map(rsi => BigNumber(rsi).toNumber())

    return _.takeRight(rsi, params.period)
  }
}

module.exports = RSI
