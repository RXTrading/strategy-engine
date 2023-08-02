const ccxt = require('ccxt')

function getCandles (exchange, market, from, to) {
  const ccxtExchange = new ccxt[exchange]()

  return ccxtExchange.fetchOHLCV(market, '1d', from, 365, { endTime: to }).then(rawCandles => {
    return rawCandles.map(candle => {
      return {
        timestamp: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        baseVolume: candle[5]
      }
    })
  })
}

module.exports = { getCandles }
