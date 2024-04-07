const _ = require('lodash')
const { Engine } = require('json-rules-engine')
const jsonata = require('jsonata')

const facts = require('./facts')
const { ValidationError } = require('./errors')
const { validate } = require('./validator')
const { Fact, Operator } = require('./models')

class StrategyEngine {
  constructor (opts = {}) {
    this.#validateAndSanitizeOpts(opts)

    this.engine = new Engine(undefined, {
      pathResolver: (object, path) => jsonata(path).evaluate(object)
    })

    opts.rules.forEach(rule => {
      const jreRule = _.cloneDeep(_.omit(rule, 'signal'))
      jreRule.event = rule.signal

      this.engine.addRule(jreRule)
    })

    opts.facts.forEach(fact => this.addFact(fact))

    const factsArray = this.#factsToArray(facts)

    for (const factConstructor of factsArray) {
      const fact = new factConstructor() /* eslint-disable-line new-cap */

      if (!this.engine.facts.has(fact.id)) {
        this.addFact(fact)
      }
    }

    for (const operator of opts.operators) {
      this.addOperator(operator)
    }
  }

  async run (facts = {}) {
    const { results, almanac } = await this.engine.run(facts)
    const signals = []

    for (let i = 0; i < results.length; i++) {
      const signal = {
        ...results[i].event,
        params: await this.#resolveParamsFromFacts(results[i].event.params, almanac),
        _rule: await this.#resolveRule(results[i], almanac)
      }

      signals.push(signal)
    }

    return signals
  }

  addFact (originalFact = {}) {
    const fact = new Fact({ id: originalFact.id, value: originalFact.value, options: originalFact.options })
    const resolveParamsFromFacts = this.#resolveParamsFromFacts.bind(this)

    if (typeof fact.value === 'function') {
      this.engine.addFact(fact.id, async (params, almanac) => {
        const resolvedParams = await resolveParamsFromFacts(params, almanac)

        return originalFact.value(resolvedParams)
      }, fact.options)
    } else {
      this.engine.addFact(fact.id, fact.value, fact.options)
    }
  }

  addOperator (originalOperator = {}) {
    const operator = new Operator({ id: originalOperator.id, evaluate: originalOperator.evaluate })

    this.engine.addOperator(operator.id, operator.evaluate.bind(originalOperator))
  }

  async #resolveParamsFromFacts (params, almanac) {
    const resolvedParams = _.cloneDeep(params)

    for (const name in resolvedParams) {
      const value = resolvedParams[name]

      if (_.isObject(value) && value.fact) {
        const factValue = await almanac.factValue(value.fact, value.params, value.path)

        resolvedParams[name] = factValue
      } else if (_.isObject(value)) {
        resolvedParams[name] = await this.#resolveParamsFromFacts(value, almanac)
      }
    }

    return resolvedParams
  }

  async #resolveRule (rule, almanac) {
    const conditionKeys = ['all', 'any']
    const resolvedRule = _.cloneDeep(rule)

    const promises = []

    promises.push(this.#addFactResultToFacts({ params: resolvedRule.event.params }, almanac))

    for (const key of conditionKeys) {
      const conditions = resolvedRule.conditions[key] || []

      for (const condition of conditions) {
        promises.push(this.#addFactResultToFacts({ params: condition.params }, almanac))
        promises.push(this.#addFactResultToFacts({ value: condition.value }, almanac))
      }
    }

    await Promise.all(promises)

    return resolvedRule
  }

  async #addFactResultToFacts (params, almanac) {
    for (const name in params) {
      const value = params[name]

      if (_.isObject(value)) {
        await this.#addFactResultToFacts(value, almanac)

        if (value.fact) {
          params[name].factResult = await almanac.factValue(value.fact, value.params, value.path)
        }
      }
    }

    return params
  }

  #factsToArray (facts = {}) {
    const array = []
    const keys = Object.keys(facts)

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const value = facts[key]

      if (typeof value === 'function') {
        if (!value.toString().toLowerCase().includes('backtest')) {
          array.push(value)
        }
      } else {
        array.push(...this.#factsToArray(value))
      }
    }

    return array
  }

  #validateAndSanitizeOpts (opts) {
    const valid = validate(opts, {
      rules: { type: 'array', items: 'object', optional: true, default: [], convert: false },
      facts: {
        type: 'array',
        optional: true,
        default: [],
        items: { type: 'object', required: true, props: Fact.schema }
      },
      operators: {
        type: 'array',
        optional: true,
        default: [],
        items: { type: 'object', required: true, props: Operator.schema }
      }
    })

    if (valid !== true) {
      throw new ValidationError(null, null, valid)
    }
  }
}

module.exports = StrategyEngine
