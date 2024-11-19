const _ = require('lodash')
const techIndicators = require('technicalindicators')

const Fact = require('../base')

class CrossDown extends Fact {
  get id () {
    return 'ta.crossDown'
  }

  get name () {
    return 'Cross Down'
  }

  get description () {
    return 'Cross down of two series'
  }

  get schema () {
    return {
      series1: { type: 'array', items: { type: 'number', convert: true }, optional: true, default: [], description: 'The series crossing.' },
      series2: { type: 'array', items: { type: 'number', convert: true }, optional: true, default: [], description: 'The series being crossed.' },
      confirmationCountMin: { type: 'number', optional: true, default: 0, min: 0, convert: true, description: 'Minimum confirmation candles below.' },
      confirmationCountMax: { type: 'number', optional: true, default: 0, min: 0, convert: true, description: 'Maximum confirmation candles below.' },
      $$strict: 'remove'
    }
  }

  async value (params = {}) {
    params = super.value(params)

    const length = params.series1.length <= params.series2.length ? params.series1.length : params.series2.length
    const series1 = _.takeRight(params.series1, length)
    const series2 = _.takeRight(params.series2, length)

    const results = techIndicators.crossDown({ lineA: series1, lineB: series2 })
    const lastCrossIndex = _.findLastIndex(results, value => value)

    // When series do not cross or first value is where cross over is signified. This would not be a confirmed cross over.
    if (!results.includes(true) || lastCrossIndex === 0) {
      return false
    }

    const remaining = series1.slice(lastCrossIndex + 1, series1.length)

    if (params.confirmationCountMin !== 0 && remaining.length < params.confirmationCountMin) {
      return false
    }

    if (params.confirmationCountMax !== 0 && remaining.length > params.confirmationCountMax) {
      return false
    }

    const crossValue = series1[lastCrossIndex]

    return remaining.every(value => value <= crossValue)
  }
}

module.exports = CrossDown
