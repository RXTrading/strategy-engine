const { expect } = require('../../helpers')
const ATR = require('../../../lib/facts/ta/atr')

describe('Fact ta.atr', () => {
  describe('#value', () => {
    const fact = new ATR()
    const defaultParams = {
      values: [
        { high: 48.70, low: 47.79, close: 48.16 },
        { high: 48.72, low: 48.14, close: 48.61 },
        { high: 48.90, low: 48.39, close: 48.75 },
        { high: 48.87, low: 48.37, close: 48.63 },
        { high: 48.82, low: 48.24, close: 48.74 },
        { high: 49.05, low: 48.64, close: 49.03 },
        { high: 49.20, low: 48.94, close: 49.07 },
        { high: 49.35, low: 48.86, close: 49.32 },
        { high: 49.92, low: 49.50, close: 49.91 },
        { high: 50.19, low: 49.87, close: 50.13 },
        { high: 50.12, low: 49.20, close: 49.53 },
        { high: 49.66, low: 48.90, close: 49.50 },
        { high: 49.88, low: 49.43, close: 49.75 },
        { high: 50.19, low: 49.73, close: 50.03 },
        { high: 50.36, low: 49.26, close: 50.31 }
      ],
      period: 14
    }

    describe('params', () => {
      describe('values', () => {
        it('defaults to an empty array', async () => {
          const result = await fact.value()

          expect(result).to.eql([])
        })

        describe('props', () => {
          describe('high', () => {
            it('is required', async () => {
              let thrownErr = null

              try {
                await fact.value({ ...defaultParams, values: [{ ...defaultParams.values[0], high: undefined }] })
              } catch (err) {
                thrownErr = err
              }

              expect(thrownErr.type).to.eql('VALIDATION_ERROR')
              expect(thrownErr.data[0].message).to.eql('values[0].high is required')
            })

            it('must be a number', async () => {
              let thrownErr = null

              try {
                await fact.value({ ...defaultParams, values: [{ ...defaultParams.values[0], high: {} }] })
              } catch (err) {
                thrownErr = err
              }

              expect(thrownErr.type).to.eql('VALIDATION_ERROR')
              expect(thrownErr.data[0].message).to.eql('values[0].high must be a number')
            })
          })

          describe('low', () => {
            it('is required', async () => {
              let thrownErr = null

              try {
                await fact.value({ ...defaultParams, values: [{ ...defaultParams.values[0], low: undefined }] })
              } catch (err) {
                thrownErr = err
              }

              expect(thrownErr.type).to.eql('VALIDATION_ERROR')
              expect(thrownErr.data[0].message).to.eql('values[0].low is required')
            })

            it('must be a number', async () => {
              let thrownErr = null

              try {
                await fact.value({ ...defaultParams, values: [{ ...defaultParams.values[0], low: {} }] })
              } catch (err) {
                thrownErr = err
              }

              expect(thrownErr.type).to.eql('VALIDATION_ERROR')
              expect(thrownErr.data[0].message).to.eql('values[0].low must be a number')
            })
          })

          describe('close', () => {
            it('is required', async () => {
              let thrownErr = null

              try {
                await fact.value({ ...defaultParams, values: [{ ...defaultParams.values[0], close: undefined }] })
              } catch (err) {
                thrownErr = err
              }

              expect(thrownErr.type).to.eql('VALIDATION_ERROR')
              expect(thrownErr.data[0].message).to.eql('values[0].close is required')
            })

            it('must be a number', async () => {
              let thrownErr = null

              try {
                await fact.value({ ...defaultParams, values: [{ ...defaultParams.values[0], close: {} }] })
              } catch (err) {
                thrownErr = err
              }

              expect(thrownErr.type).to.eql('VALIDATION_ERROR')
              expect(thrownErr.data[0].message).to.eql('values[0].close must be a number')
            })
          })
        })
      })

      describe('period', () => {
        it('defaults to 14', async () => {
          const result = await fact.value(defaultParams)

          expect(result).to.eql([0.5678571428571431])
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

    it('returns the ATR', async () => {
      const result = await fact.value(defaultParams)

      expect(result).to.eql([0.5678571428571431])
    })

    it('only returns up to periods', async () => {
      const result = await fact.value({
        values: defaultParams.values,
        period: 5
      })

      expect(result).to.eql([
        0.5545580800000003,
        0.5956464639999999,
        0.5665171712000004,
        0.5452137369600005,
        0.6561709895680007
      ])
    })
  })
})
