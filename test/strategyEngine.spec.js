const _ = require('lodash')

const { expect, chance } = require('./helpers')
const StrategyEngine = require('../lib/strategyEngine')

describe('StrategyEngine', () => {
  const defaultOptions = { rules: [], facts: [], operators: [] }

  describe('constructor', () => {
    describe('options', () => {
      describe('rules', () => {
        it('must be an array', () => {
          let thrownErr = null

          try {
            new StrategyEngine({ ...defaultOptions, rules: {} }) /* eslint-disable-line no-new */
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('rules must be an array')
        })

        describe('array item', () => {
          it('must be an object', () => {
            let thrownErr = null

            try {
              new StrategyEngine({ ...defaultOptions, rules: ['rule'] }) /* eslint-disable-line no-new */
            } catch (err) {
              thrownErr = err
            }

            expect(thrownErr.type).to.eql('VALIDATION_ERROR')
            expect(thrownErr.data[0].message).to.eql('rules[0] must be an Object')
          })
        })

        it('defaults to an empty array', () => {
          let thrownErr = false

          try {
            new StrategyEngine({ ...defaultOptions, rules: undefined }) /* eslint-disable-line no-new */
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr).to.eql(false)
        })
      })

      describe('facts', () => {
        it('must be an array', () => {
          let thrownErr = null

          try {
            new StrategyEngine({ ...defaultOptions, facts: {} }) /* eslint-disable-line no-new */
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('facts must be an array')
        })

        describe('array item', () => {
          it('must be a valid Fact', () => {
            let thrownErr = null

            try {
              new StrategyEngine({ ...defaultOptions, facts: [{ id: 'example' }] }) /* eslint-disable-line no-new */
            } catch (err) {
              thrownErr = err
            }

            expect(thrownErr.type).to.eql('VALIDATION_ERROR')
            expect(thrownErr.data[0].message).to.eql('facts[0].value is required')
          })
        })

        it('is defaults to an empty array', () => {
          let thrownErr = false

          try {
            new StrategyEngine({ ...defaultOptions, facts: undefined }) /* eslint-disable-line no-new */
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr).to.eql(false)
        })
      })

      describe('operators', () => {
        it('must be an array', () => {
          let thrownErr = null

          try {
            new StrategyEngine({ ...defaultOptions, operators: {} }) /* eslint-disable-line no-new */
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('operators must be an array')
        })

        describe('array item', () => {
          it('must be a valid Fact', () => {
            let thrownErr = null

            try {
              new StrategyEngine({ ...defaultOptions, operators: [{ id: 'example' }] }) /* eslint-disable-line no-new */
            } catch (err) {
              thrownErr = err
            }

            expect(thrownErr.type).to.eql('VALIDATION_ERROR')
            expect(thrownErr.data[0].message).to.eql('operators[0].evaluate is required')
          })
        })

        it('is defaults to an empty array', () => {
          let thrownErr = false

          try {
            new StrategyEngine({ ...defaultOptions, operators: undefined }) /* eslint-disable-line no-new */
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr).to.eql(false)
        })
      })
    })

    describe('rules', () => {
      it('adds passed rules to the engine', () => {
        const rules = [{
          name: 'example',
          conditions: { all: [] },
          signal: { type: 'example' }
        }]

        const engine = new StrategyEngine({ rules })

        expect(engine.engine.rules[0]).to.deep.match({
          ..._.omit(rules[0], 'signal'),
          ruleEvent: rules[0].signal
        })
      })
    })

    describe('facts', () => {
      it('adds passed facts to the engine', () => {
        const facts = [{ id: 'example.fact', value: chance.string() }]
        const engine = new StrategyEngine({ facts })

        expect(engine.engine.facts.has('example.fact')).to.eql(true)
      })
    })

    describe('default facts', () => {
      it('only adds default facts that do not already exist', async () => {
        const facts = [{ id: 'ta.sma', value: () => true }]
        const engine = new StrategyEngine({ facts })

        expect(engine.engine.facts.has('ta.sma')).to.eql(true)
        await expect(engine.engine.facts.get('ta.sma').calculationMethod()).to.eventually.eql(true)
      })

      it('has ta.sma', () => {
        const engine = new StrategyEngine()

        expect(engine.engine.facts.has('ta.sma')).to.eql(true)
      })

      it('has ta.ema', () => {
        const engine = new StrategyEngine()

        expect(engine.engine.facts.has('ta.ema')).to.eql(true)
      })

      it('has ta.crossUp', () => {
        const engine = new StrategyEngine()

        expect(engine.engine.facts.has('ta.crossUp')).to.eql(true)
      })

      it('has ta.crossDown', () => {
        const engine = new StrategyEngine()

        expect(engine.engine.facts.has('ta.crossDown')).to.eql(true)
      })
    })

    describe('operators', () => {
      it('adds passed operators to the engine', () => {
        const operators = [{ id: 'exampleOperator', evaluate: () => true }]
        const engine = new StrategyEngine({ operators })

        expect(engine.engine.operators.has('exampleOperator')).to.eql(true)
      })
    })
  })

  describe('rule engine', () => {
    it('does not allow undefined facts', async () => {
      const rules = [
        {
          name: 'rule1',
          conditions: { all: [{ fact: 'value', operator: 'equal', value: 1 }] },
          event: { type: 'BUY' }
        }
      ]

      const engine = new StrategyEngine({ rules })

      let error = null

      try {
        await engine.run({ open: 1, close: 2 })
      } catch (err) {
        error = err
      }

      expect(error.code).to.eql('UNDEFINED_FACT')
    })

    it('resolves path using jsonata', async () => {
      const rules = [
        {
          name: 'rule1',
          conditions: { all: [{ fact: 'values', operator: 'equal', path: '$[-1]', value: 'last' }] },
          signal: { type: 'SIGNAL_TYPE' }
        }
      ]

      const engine = new StrategyEngine({ rules })

      const signals = await engine.run({ values: ['first', 'second', 'third', 'last'] })

      expect(signals.length).to.eql(1)
      expect(signals[0].type).to.eql('SIGNAL_TYPE')
      expect(signals[0]._rule.result).to.eql(true)
    })

    describe('when jsonata raises an error', () => {
      it('throws an error', async () => {
        const rules = [
          {
            name: 'rule1',
            conditions: { all: [{ fact: 'values', operator: 'equal', path: '$[-1:]', value: 'last' }] },
            event: { type: 'BUY' }
          }
        ]

        const engine = new StrategyEngine({ rules })

        let error = null

        try {
          await engine.run({ values: [] })
        } catch (err) {
          error = err
        }

        expect(error.token).to.eql(':')
        expect(error.value).to.eql(']')
        expect(error.message).to.eql('Expected "]", got ":"')
      })
    })
  })

  describe('.addFact', () => {
    describe('when fact is invalid', () => {
      it('throws an error', async () => {
        const engine = new StrategyEngine({})

        let thrownErr = null

        try {
          engine.addFact({})
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr.type).to.eql('VALIDATION_ERROR')
        expect(thrownErr.data[0].message).to.eql('id is required')
        expect(thrownErr.data[1].message).to.eql('value is required')
      })
    })

    describe('when fact is valid', () => {
      it('adds fact to engine', () => {
        const engine = new StrategyEngine()
        engine.addFact({ id: 'example.fact', value: chance.string() })

        expect(engine.engine.facts.has('example.fact')).to.eql(true)
      })

      it('resolves fact params from facts', async () => {
        const rules = [
          {
            name: 'rule1',
            conditions: {
              all: [
                {
                  fact: 'example.fact2',
                  params: {
                    param1: 'value',
                    param2: {
                      fact: 'example.fact1',
                      params: {
                        value: 'factValue'
                      }
                    }
                  },
                  path: '$.param2',
                  operator: 'equal',
                  value: 'factValue'
                }
              ]
            },
            signal: { type: 'SIGNAL_TYPE' }
          }
        ]

        const engine = new StrategyEngine({ rules })
        engine.addFact({ id: 'example.fact1', value: params => params.value })
        engine.addFact({ id: 'example.fact2', value: params => params })

        const signals = await engine.run()

        expect(signals.length).to.eql(1)
        expect(signals[0].type).to.eql('SIGNAL_TYPE')
        expect(signals[0]._rule.result).to.eql(true)
      })
    })
  })

  describe('.addOperator', () => {
    describe('when operator is invalid', () => {
      it('throws an error', async () => {
        const engine = new StrategyEngine({})

        let thrownErr = null

        try {
          engine.addOperator({})
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr.type).to.eql('VALIDATION_ERROR')
        expect(thrownErr.data[0].message).to.eql('id is required')
        expect(thrownErr.data[1].message).to.eql('evaluate is required')
      })
    })

    describe('when operator is valid', () => {
      it('adds operator to engine', () => {
        const engine = new StrategyEngine()
        engine.addOperator({ id: 'exampleOperator', evaluate: () => true })

        expect(engine.engine.operators.has('exampleOperator')).to.eql(true)
      })
    })
  })

  describe('.run', () => {
    it('returns signals', async () => {
      const rules = [
        {
          name: 'rule1',
          conditions: { all: [{ fact: 'open', operator: 'equal', value: 1 }] },
          signal: { type: 'BUY', params: { param1: 'value' } }
        },
        {
          name: 'rule1',
          conditions: { all: [{ fact: 'close', operator: 'greaterThan', value: 1 }] },
          signal: { type: 'SELL', params: { param1: 'value' } }
        }
      ]

      const engine = new StrategyEngine({ rules })
      const signals = await engine.run({ open: 1, close: 2 })

      expect(signals.length).to.eql(2)
      expect(signals[0].type).to.eql(rules[0].signal.type)
      expect(signals[0].params).to.eql(rules[0].signal.params)
      expect(signals[1].type).to.eql(rules[1].signal.type)
      expect(signals[1].params).to.eql(rules[1].signal.params)
    })

    describe('signals', () => {
      it('resolves signal params from facts', async () => {
        const rules = [
          {
            name: 'rule1',
            conditions: { all: [{ fact: 'open', operator: 'equal', value: 1 }] },
            signal: {
              type: 'BUY',
              params: {
                param1: 'value',
                param2: {
                  fact: 'example.fact2',
                  params: {
                    param1: 'value',
                    param2: {
                      fact: 'example.fact1',
                      params: {
                        value: 'factValue'
                      }
                    }
                  },
                  path: '$.param2'
                }
              }
            }
          }
        ]

        const engine = new StrategyEngine({ rules })
        engine.addFact({ id: 'example.fact1', value: params => params.value })
        engine.addFact({ id: 'example.fact2', value: params => params })

        const signals = await engine.run({ open: 1, close: 2 })

        expect(signals[0].type).to.eql(rules[0].signal.type)
        expect(signals[0].params).to.eql({ param1: 'value', param2: 'factValue' })
      })

      it('includes original rule results', async () => {
        const rules = [
          {
            name: 'rule1',
            conditions: { all: [{ fact: 'open', operator: 'equal', value: 1 }] },
            event: { type: 'BUY', params: { param1: 'value' } }
          }
        ]

        const engine = new StrategyEngine({ rules })
        const signals = await engine.run({ open: 1, close: 2 })

        expect(signals[0]._rule.name).to.eql('rule1')
      })

      describe('rule', () => {
        it('adds factValue for unresolved event params', async () => {
          const rules = [
            {
              name: 'rule1',
              conditions: { all: [{ fact: 'open', operator: 'equal', value: 1 }] },
              signal: {
                type: 'BUY',
                params: {
                  param1: 'value',
                  param2: {
                    fact: 'example.fact2',
                    params: {
                      param1: 'value',
                      param2: {
                        fact: 'example.fact1',
                        params: {
                          value: 'factValue'
                        }
                      }
                    },
                    path: '$.param2'
                  }
                }
              }
            }
          ]

          const engine = new StrategyEngine({ rules })
          engine.addFact({ id: 'example.fact1', value: params => params.value })
          engine.addFact({ id: 'example.fact2', value: params => params })

          const signals = await engine.run({ open: 1, close: 2 })

          expect(signals[0]._rule.event.params.param2.factResult).to.eql('factValue')
        })

        it('adds factValue for unresolved rule condition value and params', async () => {
          const rules = [
            {
              name: 'rule1',
              conditions: {
                all: [
                  {
                    fact: 'example.fact2',
                    params: {
                      param1: 'value',
                      param2: {
                        fact: 'example.fact1',
                        params: {
                          value: 'factValue'
                        }
                      }
                    },
                    path: '$.param2',
                    operator: 'equal',
                    value: {
                      fact: 'example.fact2',
                      params: {
                        value: {
                          fact: 'example.fact1',
                          params: { value: 'factValue' }
                        }
                      },
                      path: '$.value'
                    }
                  }
                ]
              },
              event: { type: 'SIGNAL_TYPE' }
            }
          ]

          const engine = new StrategyEngine({ rules })
          engine.addFact({ id: 'example.fact1', value: params => params.value })
          engine.addFact({ id: 'example.fact2', value: params => params })

          const signals = await engine.run({ open: 1, close: 2 })

          expect(signals[0]._rule.conditions.all[0].factResult).to.eql('factValue')
          expect(signals[0]._rule.conditions.all[0].params.param2.factResult).to.eql('factValue')
          expect(signals[0]._rule.conditions.all[0].value.factResult).to.eql('factValue')
          expect(signals[0]._rule.conditions.all[0].value.params.value.factResult).to.eql('factValue')
        })
      })
    })
  })
})
