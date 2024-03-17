const Validator = require('fastest-validator')

const validatorConfig = require('../config/validator')

const INTERVALS = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '1w', '4w']

const aliases = {
  exchange: { type: 'string', required: true },
  interval: { type: 'enum', required: true, values: INTERVALS },
  market: { type: 'string', required: true }
}

const validator = new Validator(validatorConfig)

for (const key in aliases) {
  validator.alias(key, aliases[key])
}

function validate (params = {}, schema = {}) {
  const check = validator.compile(schema)

  return check(params)
}

module.exports = { validator, validate }
