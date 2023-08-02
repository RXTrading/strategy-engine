const { StrategyEngine } = require('../')
const { getCandles } = require('./utils/candles')

const signals = []
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
          fact: 'candle',
          path: 'open',
          operator: 'lessThanInclusive',
          value: { fact: 'candle', path: 'close' }
        }
      ]
    },
    signal: {
      type: 'BUY',
      params: {
        timestamp: { fact: 'candle', path: 'timestamp' },
        market,
        type: 'MARKET',
        amount: 100
      }
    }
  },
  // WHEN TO SELL
  {
    name: 'sell',
    conditions: {
      all: [
        {
          fact: 'candle',
          path: 'close',
          operator: 'lessThanInclusive',
          value: { fact: 'candle', path: 'open' }
        }
      ]
    },
    signal: {
      type: 'SELL',
      params: {
        timestamp: { fact: 'candle', path: 'timestamp' },
        market,
        type: 'MARKET',
        amount: '100%'
      }
    }
  }
]

async function run () {
  const candles = await getCandles(exchange, market, fromTimestamp.getTime(), toTimestamp.getTime())
  const engine = new StrategyEngine({ rules })

  console.time('Running time')
  for (let i = 0; i < candles.length; i++) {
    signals.push(await engine.run({ candle: candles[i] }))
  }
  console.timeEnd('Running time')
}

run().then(() => {
  console.log('Total signals', signals.length)
  console.log('Total buy', signals.flat().filter(signal => signal.type === 'BUY').length)
  console.log('Total sell', signals.flat().filter(signal => signal.type === 'SELL').length)
}).catch(err => console.log(err))
