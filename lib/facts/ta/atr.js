const _ = require('lodash')
const BigNumber = require('bignumber.js')
const techIndicators = require('technicalindicators')

const Fact = require('../base')

class ATR extends Fact {
  get id () {
    return 'ta.atr'
  }

  get name () {
    return 'Average True Range (ATR)'
  }

  get description () {
    return 'Calculate the Average True Range from values over period'
  }

  get schema () {
    return {
      values: {
        type: 'array',
        items: {
          type: 'object',
          props: {
            high: { type: 'number', required: true, convert: true, description: 'The open value' },
            low: { type: 'number', required: true, convert: true, description: 'The high value' },
            close: { type: 'number', required: true, convert: true, description: 'The low value' }
          },
          strict: 'remove',
          convert: true
        },
        optional: true,
        default: [],
        description: 'Values to apply indicator to.'
      },
      period: { type: 'number', optional: true, default: 14, min: 1, convert: true, description: 'The period to calculate.' },
      $$strict: 'remove'
    }
  }

  async value (params = {}) {
    params = super.value(params)

    const atr = techIndicators.ATR.calculate({
      high: params.values.map(v => BigNumber(v.high).toNumber()),
      low: params.values.map(v => BigNumber(v.low).toNumber()),
      close: params.values.map(v => BigNumber(v.close).toNumber()),
      period: params.period
    })

    return _.takeRight(atr, params.period)
  }
}

module.exports = ATR
