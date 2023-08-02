const { expect } = require('../../helpers')
const SMA = require('../../../lib/facts/ta/sma')

describe('Fact ta.sma', () => {
  describe('#value', () => {
    const fact = new SMA()

    describe('params', () => {
      describe('values', () => {
        it('defaults to an empty array', async () => {
          const result = await fact.value()

          expect(result).to.eql([])
        })

        it('must be an array of numbers', async () => {
          let thrownErr = null

          try {
            await fact.value({ values: ['ten'] })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('values[0] must be a number')
        })
      })

      describe('period', () => {
        it('defaults to 14', async () => {
          const result = await fact.value({
            values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
          })

          expect(result).to.eql([7.5])
        })

        it('must be an number', async () => {
          let thrownErr = null

          try {
            await fact.value({ period: 'ten' })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('period must be a number')
        })

        it('must be at least 1', async () => {
          let thrownErr = null

          try {
            await fact.value({ period: 0 })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('period must be greater than or equal to 1')
        })
      })
    })

    it('returns the SMA', async () => {
      const result = await fact.value({
        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        period: 10
      })

      expect(result).to.eql([5.5])
    })

    it('only returns up to periods', async () => {
      const result = await fact.value({
        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        period: 5
      })

      expect(result).to.eql([4, 5, 6, 7, 8])
    })
  })
})
