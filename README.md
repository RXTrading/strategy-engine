# Strategy Engine
A lightweight, extensible strategy runner.

* [Synopsis](#Synopsis)
* [Installation](#installation)
* [Usage](#usage)
* [Rules](#rules)
  * [Conditions](#conditions)
  * [Signal](#signal)
* [Facts](#facts)
  * [Engine facts](#engine-facts)
  * [Run time facts](#run-time-facts)
  * [Using facts](#using-facts)
* [Built-in facts](#built-in-facts)
* [Operators](#operators)
  * [Defining operators](#defining-operators)
* [Built-in operators](#built-in-operators)

## Synopsis
Strategy engine is a lightweight rules engine which runs strategies, provided as JSON rules, against market data provided as facts. The engine returns signals when ideal rule conditions are met.

Run complex strategies (rules) against market conditions, or any other data to provide signals when ideal conditions are met. Rules are simply JSON
- It’s intentionally lightweight and utilises some of the best open source projects to achieve this. [See thanks section]

### Under Active Development
This strategy engine is under active development. Expect breaking changes. Documentation also needs to be improved.

## Key features
- Describe highly complex strategies with ease, usin human readable **JSON structured rules**.
- Built-in technical analysis facts (indicators) to get you started.
- Built-in operators (equal, less than etc) to get you started.
- Bring your own facts. **Provide custom facts** such as technical indicators and market data.
- Bring your own operators. **Provide custom operators** to reduce complexity of strategy rules.

# Installation
No official NPM package will be released until version 1.0.0. For now, link to the git repo.

```bash
npm install --save git+ssh://github.com/rxtrading/strategy-engine.git#main
```

# Usage
```javascript
const { StrategyEngine } = require('@rxtrading/strategy-engine')

const engine = new StrategyEngine({ rules: [], facts: [], operators: [] })
```

## Really basic example
```javascript
const { StrategyEngine } = require('@rxtrading/strategy-engine')

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
```

## Further examples
For more examples see `./examples`.

# Rules
Rules are used to determine when signals should be provided. When all required conditions within a rule are met, the corresponding signal is provided.

The basic structure for a rule.
```javascript
new StrategyEngine({
  rules: [
    {
      name: "string",
      conditions: { /**/ },
      signal: { type: "string" }
    }
  ]
})
```

Multiple rules can be passed into the engine, to represent strategies as simple or as complex as you can imagine. For example, you may have a rule to buy, and a rule to sell.

```javascript
new StrategyEngine({
  rules: [
    {
      name: "Buy",
      conditions: { /**/ },
      signal: { type: "OPEN_POSITION" }
    },
    {
      name: "Sell",
      conditions: { /**/ },
      signal: { type: "CLOSE_POSITION" }
    },
  ]
})
```

## Name
A simple name for your rule, it's a required property but is simply there for easy rule identification during debugging and analysis.

## Conditions
Rule conditions are a combination of facts, operators, and values that determine whether the rule is a `success` or a `failure`.

### Basic conditions
The simplest form of a condition consists of a fact, an operator, and a value. When the engine runs, the operator is used to compare the fact against the value.

```javascript
const rule = {
  conditions: { 
    all: [{
      "fact": "fact.name",
      "operator": "equal",
      "value": true
    }]
  }
}
```

### Boolean expressions: `all`, `any` and `not`
Each rule's conditions must have either an `all`, `any` or a `not` operator at its root, containing an array of conditions. 

- The `all` operator specifies that all conditions contained within must be truthy for the rule to be considered a `success`. 
- The `any` operator only requires one condition to be truthy for the rule to succeed. The 
- The `not` operator requires a condition.

Boolean conditions can be nested within one another to produce complex boolean expressions.

```javascript
const rule = {
  conditions: {
    all: [
      { /* condition 1 */ },
      { /* condition 2 */ },
      { /* condition n */ },
    ]
  }
}

const nestedBoolean = {
  conditions: {
    any: [
      { /* condition 1 */ },
      { /* condition 2 */ },
      { /* condition n */ },
      {
        all: [ /* more conditions */ ]
      }
    ],
    not: { /* condition */ }
  }
}
```

## Signal
A signal is an object returned when a rule passes. They must contain a `type` and may also contain any number of `params`. Params can be facts also.

```javascript
const rule = {
  conditions: { /**/ },
  signal: {
    type: 'OPEN_POSITION',
    params: {
      exchange: 'binance',
      market: 'BTC/USDT'
    }
  }
}
```

In the above example, when the rule passes its conditions, the signal object is returned.

# Facts
Facts are either constants (any value) or computed values (dynamic). They are either registered upon instantiation of the strategy engine, after instantiation or passed in during runtime.

## Engine facts
Engine facts are defined at instantiation of the engine, or after instantiation. They can be either static values (think configuration options), or they can be computed values (think indicators, market data such as OHLC and orders, AI, etc).

**Instantiation**
```javascript
const engine = new StrategyEngine({ 
  rules: [
    {
      name: 'Open',
      conditions: {
        and: [
          {
            fact: 'multiply',
            params: { number: 2, multiplier: 4 },
            operator: 'equal',
            value: 8
          }
        ]
      }
      signal: { type: 'OPEN_POSITION' }
    }
  ],
  facts: [
    { 
      id: 'multiply',
      value: params => params.number * params.multiplier
    }
  ]
})
```

**After instantiation**
```javascript
const engine = new StrategyEngine({ 
  rules: [
    {
      name: 'Open',
      conditions: {
        and: [
          {
            fact: 'multiply',
            params: { number: 2, multiplier: 4 },
            operator: 'equal',
            value: 8
          }
        ]
      },
      signal: { type: 'OPEN_POSITION' }
    }
  ]
})

engine.addFact({ 
  id: 'multiply',
  value: params => params.number * params.multiplier
})
```

## Run-time facts
Run facts are provided at run time. They are usually static values, but can be computed. For example, the current candle, or the current tick can be provided as run-time facts. They are particular to that run of the strategy.

```javascript
const engine = new StrategyEngine({
  rules: [
    {
      name: 'Open',
      conditions: {
        and: [
          {
            fact: 'positions',
            path: 'open',
            operator: 'lessThan',
            value: 1
          }
        ]
      },
      signal: { type: 'OPEN_POSITION' }
    }
  ]
})

engine.run({ positions: { open: 1 } })
```

## Using facts
Facts can be used in any of the following, recursively.
- Conditions
- Condition fact param
- Condition values
- Condition value fact params
- Signal params

# Built-in facts
Strategy engine comes with some built in facts.

## Market base symbol: `market.base` 
This fact provides the base symbol of `market`.

**Example**
```json
{
  "fact": "market.base",
  "params": {
    "market": "BTC/USDT"
  }
}
// Returns BTC
```

### Properties
Property | Default  | Description
-------- | -------- | -----------
`market` |          | The market to get the base symbol from.

## Market quote symbol: `market.quote` 
This fact provides the quote symbol of `market`.

**Example**
```json
{
  "fact": "market.quote",
  "params": {
    "market": "BTC/USDT"
  }
}
// Returns USDT
```

### Properties
Property | Default  | Description
-------- | -------- | -----------
`market` |          | The market to get the quote symbol from.

## Exponential Moving Average: `ta.ema` 
This fact provides the EMA of `values` for a `period`.

**Example with default period**
```json
{
  "fact": "ta.ema",
  "params": {
    "values": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  }
}
```

**Example with custom period**
```json
{
  "fact": "ta.ema",
  "params": {
    "values": [1, 2, 3, 4, 5, 6],
    "period": 5
  }
}
```

### Properties
Property | Default  | Description
-------- | -------- | -----------
`values` | `[]`     | The values to perform the EMA on.
`period` | `14`     | The period to perform SMA for, returns array with length of periods.

## Simple Moving Average: `ta.sma` 
This fact provides the SMA of `values` for a `period`.

**Example with default period**
```json
{
  "fact": "ta.sma",
  "params": {
    "values": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  }
}
```

**Example with custom period**
```json
{
  "fact": "ta.sma",
  "params": {
    "values": [1, 2, 3, 4, 5, 6],
    "period": 5
  }
}
```

### Properties
Property | Default  | Description
-------- | -------- | -----------
`values` | `[]`     | The values to perform the SMA on.
`period` | `14`     | The period to perform SMA for, returns array with length of periods.

## Relative Strength Index: `ta.rsi` 
This fact provides the RSI of `values` for a `period`.

**Example with default period**
```json
{
  "fact": "ta.rsi",
  "params": {
    "values": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  }
}
```

**Example with custom period**
```json
{
  "fact": "ta.rsi",
  "params": {
    "values": [1, 2, 3, 4, 5, 6],
    "period": 5
  }
}
```

### Properties
Property | Default  | Description
-------- | -------- | -----------
`values` | `[]`     | The values to perform the RSI on.
`period` | `14`     | The period to perform RSI for, returns array with length of periods.

## Cross Up: `ta.crossUp` 
This fact returns whether `series1`, crossed **up** over `series2` under certain conditions.

**Example with no specific required values above cross over**
```json
{
  "fact": "ta.crossUp",
  "params": {
    "series1": [1, 2, 3, 4, 5],
    "series1": [1, 1, 2, 3, 4]
  },
  "value": true
}
```

**Example requiring certain amount of values to be above cross over**
```json
{
  "fact": "ta.crossUp",
  "params": {
    "series1": [1, 2, 3, 4, 5],
    "series1": [1, 1, 2, 3, 4],
    "confirmationCountMin": 1,
    "confirmationCountMax": 3,
  },
  "value": false
}
```

### Properties
Property               | Default  | Description
---------------------- | -------- | -----------
`series1`              | `[]`     | The values of the first series. E.g, Fast EMA.
`series1`              | `[]`     | The values of the second series. E.g, Slow EMA.
`confirmationCountMin` | `0`      | Number of minimum required values including and after the cross over as confirmation of crossover. When `0`, no minimum is required.
`confirmationCountMax` | `0`      | Number of maximum required values including and after the cross over as confirmation of crossover. When `0`, no maximum is required.

## Cross down: `ta.crossDown` 
This fact returns whether `series1`, crossed **down** below `series2` under certain conditions.

**Example with no specific required values below cross over**
```json
{
  "fact": "ta.crossDown",
  "params": {
    "series1": [6, 5, 3, 2, 1],
    "series1": [6, 5, 5, 4, 3]
  },
  "value": true
}
```

**Example requiring certain amount of values to be above cross under**
```json
{
  "fact": "ta.crossDown",
  "params": {
    "series1": [6, 5, 3, 2, 1],
    "series1": [6, 5, 5, 4, 3],
    "confirmationCountMin": 2,
    "confirmationCountMax": 4,
  },
  "value": false
}
```

### Properties
Property              | Default  | Description
--------------------- | -------- | -----------
`series1`              | `[]`     | The values of the first series. E.g, Fast EMA.
`series1`              | `[]`     | The values of the second series. E.g, Slow EMA.
`confirmationCountMin` | `0`      | Number of minimum required values including and after the cross under as confirmation of cross under. When `0`, no minimum is required.
`confirmationCountMax` | `0`      | Number of maximum required values including and after the cross under as confirmation of cross under. When `0`, no maximum is required.


# Operators
There are two types of operators, boolean operators and fact operators (or just operators).


## Boolean operators
For more on boolean operators, see [Conditions](#conditions).

## Operators
Operators are used in rules for comparing the value returned by a _fact_ to the _value_ property of the rule. If the condition is truthy, it passes.

```javascript
const engine = new StrategyEngine({
  rules: [
    {
      name: 'Example',
      conditions: {
        and: [
          // Will return true as fact result is 8, and 8 is a multiple of 4
          {
            fact: 'multiply',
            params: { number: 2, multiplier: 4 },
            operator: 'multipleOf',
            value: 4
          }
        ]
      }
      signal: { /**/ }
    }
  ],
  operators: [
    // Check if factValue is a multiple of the jsonValue
    { 
      id: 'multipleOf', 
      evaluate: (factValue, jsonValue) => factValue % jsonValue === 0 
    }
  ]
})

engine.run()
```

# Built-in operators
id                     | type            | Description
---------------------- | --------------- | -------- 
`equal`                | String, Numeric | _fact_ must strictly equal _value_
`notEqual`             | String, Numeric | _fact_ must strictly not equal _value_
`lessThan`             | Numeric         | _fact_ must be less than _value_
`lessThanInclusive`    | Numeric         | _fact_ must be less than or equal to _value_
`greaterThan`          | Numeric         | _fact_ must be greater than _value_
`greaterThanInclusive` | Numeric         | _fact_ must be greater than or equal to _value_
`in`                   | Array           | _fact_ must be included in _value_ (an array)
`notIn`                | Array           | _fact_ must not be included in _value_ (an array)
`contains`             | Array           | _fact_ (an array) must include _value_
`doesNotContain`       | Array           | _fact_ (an array) must not include _value_

# Acknowledgements
- [json-rules-engine](https://github.com/CacheControl/json-rules-engine): A rules engine expressed in JSON

# Contributing
Contributions are welcome! Please read the contribution guidelines first.

- File an issue to report bugs or request features
- Open a pull request to submit changes and improvements

When submitting code, please:
- Follow the existing code style
- Write clear commit messages
- Add/update relevant tests and documentation
- Open an issue before submitting large changes

# License
Moleculer DIM is available under the [MIT license](https://tldrlegal.com/license/mit-license).