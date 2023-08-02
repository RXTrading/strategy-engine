const _ = require('lodash')
const BigNumber = require('bignumber.js')
const techIndicators = require('technicalindicators')

const Fact = require('../base')

class SMA extends Fact {
  get id () {
    return 'ta.sma'
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

    const sma = techIndicators.SMA.calculate(params).map(sma => BigNumber(sma).toNumber())

    return _.takeRight(sma, params.period)
  }
}

module.exports = SMA
