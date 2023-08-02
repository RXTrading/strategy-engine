const { expect, chance } = require('../helpers')

const Operator = require('../../lib/models/operator')

describe('Operator Model', () => {
  describe('params', () => {
    const defaultParams = {
      id: chance.string({ casing: 'lower', alpha: true, length: 10 }),
      evaluate: chance.string()
    }

    describe('id', () => {
      it('is required', () => {
        let thrownErr = null

        try {
          new Operator({ ...defaultParams, id: undefined }) /* eslint-disable-line no-new */
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr.type).to.eql('VALIDATION_ERROR')
        expect(thrownErr.data[0].message).to.eql('id is required')
      })

      it('must be a string', () => {
        let thrownErr = null

        try {
          new Operator({ ...defaultParams, id: chance.integer() }) /* eslint-disable-line no-new */
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr.type).to.eql('VALIDATION_ERROR')
        expect(thrownErr.data[0].message).to.eql('id must be a string')
      })
    })

    describe('evaluate', () => {
      it('is required', () => {
        let thrownErr = null

        try {
          new Operator({ ...defaultParams, evaluate: undefined }) /* eslint-disable-line no-new */
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr.type).to.eql('VALIDATION_ERROR')
        expect(thrownErr.data[0].message).to.eql('evaluate is required')
      })

      it('must be a function', () => {
        let thrownErr = null

        try {
          new Operator({ ...defaultParams, evaluate: chance.string() }) /* eslint-disable-line no-new */
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr.type).to.eql('VALIDATION_ERROR')
        expect(thrownErr.data[0].message).to.eql('evaluate must be a function')
      })
    })
  })
})
