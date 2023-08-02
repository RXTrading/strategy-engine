const chai = require('chai')
const chance = require('chance')()
const expect = chai.expect

chai.use(require('chai-samsam'))
chai.use(require('chai-as-promised'))
chai.use(require('chai-datetime'))
chai.use(require('dirty-chai'))

module.exports = {
  expect,
  chance
}
