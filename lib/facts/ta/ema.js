const _ = require('lodash')
const BigNumber = require('bignumber.js')
const techIndicators = require('technicalindicators')

const Fact = require('../base')

class EMA extends Fact {
  get id () {
    return 'ta.ema'
  }

  get name () {
    return 'Expontential Moving Average (EMA)'
  }

  get description () {
    return 'Calculate the Exponential Moving Average (EMA) from values over period'
  }

  get schema () {
    return {
      values: { type: 'array', items: { type: 'number', convert: true }, optional: true, default: [], description: 'Values to apply indicator to.' },
      period: { type: 'number', optional: true, default: 14, min: 1, convert: true, description: 'The period to calculate.' },
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
