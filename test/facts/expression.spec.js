const { expect } = require('../helpers')
const Expression = require('../../lib/facts/expression')

describe('Fact expression', () => {
  describe('#value', () => {
    const fact = new Expression()

    describe('params', () => {
      const defaultParams = {
        expression: 'a + b',
        data: { a: 1, b: 2 }
      }

      describe('expression', () => {
        it('is required', async () => {
          let thrownErr = null

          try {
            await fact.value({ ...defaultParams, expression: undefined })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('expression is required')
        })

        it('must a string', async () => {
          let thrownErr = null

          try {
            await fact.value({ ...defaultParams, expression: {} })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('expression must be a string')
        })
      })

      describe('data', () => {
        it('must be an object', async () => {
          let thrownErr = null

          try {
            await fact.value({ ...defaultParams, data: 'invalid' })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('data must be an Object')
        })
      })
    })

    it('evaluates expression against provided data', async () => {
      const result = await fact.value({
        expression: 'a + b',
        data: { a: 1, b: 2 }
      })

      expect(result).to.eql(3)
    })
  })
})
