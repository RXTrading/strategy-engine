const { StrategyEngine } = require('../')

const engine = new StrategyEngine({
  rules: [
    {
      name: 'BUY',
      conditions: {
        all: [
          {
            fact: 'open',
            operator: 'lessThan',
            value: { fact: 'close' }
          }
        ]
      },
      signal: {
        type: 'BUY',
        params: {
          timestamp: { fact: 'timestamp' }
        }
      }
    },
    {
      name: 'SELL',
      conditions: {
        all: [
          {
            fact: 'open',
            operator: 'greaterThan',
            value: { fact: 'close' }
          }
        ]
      },
      signal: {
        type: 'SELL',
        params: {
          timestamp: { fact: 'timestamp' }
        }
      }
    }
  ]
})

engine.run({ timestamp: '2020-01-01', open: 10, close: 20 }).then(signals => console.log(signals))
engine.run({ timestamp: '2020-01-02', open: 20, close: 19 }).then(signals => console.log(signals))
