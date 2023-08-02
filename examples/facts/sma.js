const _ = require('lodash')

const { StrategyEngine } = require('../..')
const { getCandles } = require('../utils/candles')

const exchange = 'binance'
const market = 'BTC/USDT'
const fromTimestamp = new Date('2020-07-01T00:00:00.000Z')
const toTimestamp = new Date('2021-07-01T00:00:00.000Z')
const rules = [
  // WHEN TO BUY
  {
    name: 'buy',
    conditions: {
      all: [
        {
          fact: 'ta.sma',
          path: '$[-1]',
          params: {
            values: {
              fact: 'ohlc',
              path: '[$.close]',
              params: {
                before: { fact: 'candle', path: 'timestamp' },
                limit: 7
              }
            },
            period: 7
          },
          operator: 'greaterThan',
          value: {
            fact: 'ta.sma',
            path: '$[-1]',
            params: {
              values: {
                fact: 'ohlc',
                path: '[$.close]',
                params: {
                  before: { fact: 'candle', path: 'timestamp' },
                  limit: 14
                }
              },
              period: 14
            }
          }
        }
      ]
    },
    signal: {
      type: 'BUY',
      params: {
        candle: {
          fact: 'candle'
        }
      }
    }
  },
  // WHEN TO SELL
  {
    name: 'sell',
    conditions: {
      all: [
        {
          fact: 'ta.sma',
          path: '$[-1]',
          params: {
            values: {
              fact: 'ohlc',
              path: '[$.close]',
              params: {
                before: { fact: 'candle', path: 'timestamp' },
                limit: 7
              }
            },
            period: 7
          },
          operator: 'lessThan',
          value: {
            fact: 'ta.sma',
            path: '$[-1]',
            params: {
              values: {
                fact: 'ohlc',
                path: '[$.close, $timestamp]',
                params: {
                  before: { fact: 'candle', path: 'timestamp' },
                  limit: 14
                }
              },
              period: 14
            }
          }
        }
      ]
    },
    signal: {
      type: 'SELL',
      params: {
        candle: {
          fact: 'candle'
        }
      }
    }
  }
]

async function run () {
  const candles = await getCandles(exchange, market, fromTimestamp.getTime(), toTimestamp.getTime())
  const engine = new StrategyEngine({ rules })
  const signals = []

  // Custom fact to provide OHLC as values to ta
  engine.addFact({
    id: 'ohlc',
    value: params => _.takeRight(candles.filter(ohlc => ohlc.timestamp < params.before), params.limit)
  })

  console.time('Running time')

  for (let i = 0; i < candles.length; i++) {
    const newSignals = await engine.run({ candle: candles[i] })

    signals.push(newSignals)
  }

  return signals.flat()
}

run().then(signals => {
  console.log('Total signals', signals.length)
  console.log('Total buy', signals.filter(signal => signal.type === 'BUY').length)
  console.log('Total sell', signals.filter(signal => signal.type === 'SELL').length)
  console.log('signals', JSON.stringify(signals[0]._rule))
}).catch(err => console.log(err))
