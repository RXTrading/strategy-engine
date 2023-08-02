const { expect } = require('../../helpers')
const RSI = require('../../../lib/facts/ta/rsi')

describe('Fact ta.rsi', () => {
  describe('#value', () => {
    const fact = new RSI()

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
            values: [
              127.75, 129.02, 132.75, 145.40, 148.98,
              137.52, 147.38, 139.05, 137.23, 149.30,
              162.45, 178.95, 200.35, 221.90, 243.23
            ]
          })

          expect(result).to.eql([86.38])
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

    it('returns the RSI', async () => {
      const result = await fact.value({
        values: [
          127.75, 129.02, 132.75, 145.40, 148.98,
          137.52, 147.38, 139.05, 137.23, 149.30,
          162.45, 178.95, 200.35, 221.90, 243.23,
          243.52, 286.42, 280.27, 277.35, 269.02,
          263.23, 214.90
        ],
        period: 11
      })

      expect(result).to.eql([77.11, 81.68, 85, 87.47, 87.5, 91.07, 87.14, 85.23, 79.72, 75.97, 53.04])
    })

    it('only returns up to periods', async () => {
      const result = await fact.value({
        values: [
          127.75, 129.02, 132.75, 145.40, 148.98,
          137.52, 147.38, 139.05, 137.23, 149.30,
          162.45, 178.95, 200.35, 221.90, 243.23,
          243.52, 286.42, 280.27, 277.35, 269.02,
          263.23, 214.90
        ],
        period: 6
      })

      expect(result).to.eql([96.26, 89.89, 86.62, 77.03, 70.52, 38.19])
    })
  })
})
