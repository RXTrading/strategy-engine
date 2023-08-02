const { expect, chance } = require('../helpers')

const Fact = require('../../lib/models/fact')

describe('Fact Model', () => {
  describe('params', () => {
    const defaultParams = {
      id: chance.string({ casing: 'lower', alpha: true, length: 10 }),
      value: chance.string(),
      options: {
        cache: chance.bool(),
        priority: chance.integer({ min: 1, max: 100 })
      }
    }

    describe('id', () => {
      it('is required', () => {
        let thrownErr = null

        try {
          new Fact({ ...defaultParams, id: undefined }) /* eslint-disable-line no-new */
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr.type).to.eql('VALIDATION_ERROR')
        expect(thrownErr.data[0].message).to.eql('id is required')
      })

      it('must be a string', () => {
        let thrownErr = null

        try {
          new Fact({ ...defaultParams, id: chance.integer() }) /* eslint-disable-line no-new */
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr.type).to.eql('VALIDATION_ERROR')
        expect(thrownErr.data[0].message).to.eql('id must be a string')
      })
    })

    describe('value', () => {
      it('is required', () => {
        let thrownErr = null

        try {
          new Fact({ ...defaultParams, value: undefined }) /* eslint-disable-line no-new */
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr.type).to.eql('VALIDATION_ERROR')
        expect(thrownErr.data[0].message).to.eql('value is required')
      })

      it('can be anything', () => {
        let thrownErr = null

        try {
          new Fact({ ...defaultParams, value: () => {} }) /* eslint-disable-line no-new */
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr).to.eql(null)
      })
    })

    describe('options', () => {
      it('must be an object', () => {
        let thrownErr = null

        try {
          new Fact({ ...defaultParams, options: chance.string() }) /* eslint-disable-line no-new */
        } catch (err) {
          thrownErr = err
        }

        expect(thrownErr.type).to.eql('VALIDATION_ERROR')
        expect(thrownErr.data[0].message).to.eql('options must be an Object')
      })

      describe('options.cache', () => {
        it('must be a boolean', () => {
          let thrownErr = null

          try {
            /* eslint-disable no-new */
            new Fact({
              ...defaultParams,
              options: { ...defaultParams, cache: chance.string() }
            })
            /* eslint-enable no-new */
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('options.cache must be a boolean')
        })

        it('defaults to true', () => {
          const model = new Fact({ ...defaultParams, options: {} })

          expect(model.options.cache).to.eql(true)
        })
      })

      describe('options.priroty', () => {
        it('must be a number', () => {
          let thrownErr = null

          try {
            /* eslint-disable no-new */
            new Fact({
              ...defaultParams,
              options: { ...defaultParams, priority: chance.string() }
            })
            /* eslint-enable no-new */
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('options.priority must be a number')
        })

        it('must be a number greater than 1', () => {
          let thrownErr = null

          try {
            /* eslint-disable no-new */
            new Fact({
              ...defaultParams,
              options: { ...defaultParams, priority: chance.integer({ max: 0 }) }
            })
            /* eslint-enable no-new */
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('options.priority must be greater than or equal to 1')
        })

        it('defaults to 1', () => {
          const model = new Fact({ ...defaultParams, options: {} })

          expect(model.options.priority).to.eql(1)
        })
      })

      it('defaults to an empty object', () => {
        const model = new Fact({ ...defaultParams, options: undefined })

        expect(model.options).not.to.eql(null)
        expect(model.options).to.eql({})
      })
    })
  })
})
