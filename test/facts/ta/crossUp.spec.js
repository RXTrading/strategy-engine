const { expect } = require('../../helpers')
const CrossUp = require('../../../lib/facts/ta/crossUp')

describe('Fact ta.crossUp', () => {
  describe('#value', () => {
    const fact = new CrossUp()

    describe('params', () => {
      describe('series1', () => {
        it('defaults to an empty array', async () => {
          const result = await fact.value()

          expect(result).to.eql(false)
        })

        it('must be an array of numbers', async () => {
          let thrownErr = null

          try {
            await fact.value({ series1: ['ten'] })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('series1[0] must be a number')
        })
      })

      describe('series2', () => {
        it('defaults to an empty array', async () => {
          const result = await fact.value()

          expect(result).to.eql(false)
        })

        it('must be an array of numbers', async () => {
          let thrownErr = null

          try {
            await fact.value({ series2: ['ten'] })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('series2[0] must be a number')
        })
      })

      describe('confirmationCountMin', () => {
        it('defaults to 0', async () => {
          const result = await fact.value({
            series1: [1, 2, 3, 4, 5],
            series2: [1, 2, 2, 3, 3]
          })

          expect(result).to.eql(true)
        })

        it('must be an number', async () => {
          let thrownErr = null

          try {
            await fact.value({ confirmationCountMin: 'ten' })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('confirmationCountMin must be a number')
        })

        it('must be at least 0', async () => {
          let thrownErr = null

          try {
            await fact.value({ confirmationCountMin: -1 })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('confirmationCountMin must be greater than or equal to 0')
        })
      })

      describe('confirmationCountMax', () => {
        it('defaults to 0', async () => {
          const result = await fact.value({
            series1: [1, 2, 3, 4, 5],
            series2: [1, 2, 2, 3, 3]
          })

          expect(result).to.eql(true)
        })

        it('must be an number', async () => {
          let thrownErr = null

          try {
            await fact.value({ confirmationCountMax: 'ten' })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('confirmationCountMax must be a number')
        })

        it('must be at least 0', async () => {
          let thrownErr = null

          try {
            await fact.value({ confirmationCountMax: -1 })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('confirmationCountMax must be greater than or equal to 0')
        })
      })
    })

    describe('when series do not cross', () => {
      it('returns false', async () => {
        const result = await fact.value({
          series1: [1, 2, 3, 4, 5],
          series2: [1, 2, 3, 4, 5]
        })

        expect(result).to.eql(false)
      })
    })

    describe('when a cross over occurs in the first period', () => {
      it('returns false', async () => {
        const result = await fact.value({
          series1: [2, 2, 3, 4, 5],
          series2: [1, 2, 3, 4, 5]
        })

        expect(result).to.eql(false)
      })
    })

    describe('when there is a cross over', () => {
      describe('and not all of the remaining values are greater than or equal to cross over itself', () => {
        it('returns false', async () => {
          const result = await fact.value({
            series1: [1, 2, 1, 2, 1],
            series2: [1, 1, 1, 1, 1]
          })

          expect(result).to.eql(false)
        })
      })

      describe('and all of the remaining values are greater than or equal to cross over itself', () => {
        it('returns true', async () => {
          const result = await fact.value({
            series1: [1, 2, 3, 4, 5],
            series2: [1, 1, 3, 4, 5]
          })

          expect(result).to.eql(true)
        })
      })

      describe('and confirmationCountMin is set', () => {
        describe('and is 0', () => {
          it('returns true', async () => {
            const result = await fact.value({
              series1: [1, 1, 2, 4, 6],
              series2: [1, 1, 2, 3, 4],
              confirmationCountMin: 0
            })

            expect(result).to.eql(true)
          })
        })

        describe('and amount of values after cross over is less than confirmationCountMin', () => {
          it('returns false', async () => {
            const result = await fact.value({
              series1: [1, 1, 2, 4, 6],
              series2: [1, 1, 2, 3, 4],
              confirmationCountMin: 3
            })

            expect(result).to.eql(false)
          })
        })

        describe('and amount of values after cross over is greater than or equal to confirmationCountMin', () => {
          it('returns true', async () => {
            const result = await fact.value({
              series1: [1, 1, 2, 4, 6],
              series2: [1, 1, 2, 3, 4],
              confirmationCountMin: 1
            })

            expect(result).to.eql(true)
          })
        })
      })

      describe('when confirmationCountMax is set', () => {
        describe('and is 0', () => {
          it('returns true', async () => {
            const result = await fact.value({
              series1: [1, 1, 2, 4, 6],
              series2: [1, 1, 2, 3, 4],
              confirmationCountMax: 0
            })

            expect(result).to.eql(true)
          })
        })

        describe('and amount of values after cross over is greater than confirmationCountMax', () => {
          it('returns false', async () => {
            const result = await fact.value({
              series1: [1, 1, 2, 4, 6, 7],
              series2: [1, 1, 2, 3, 4, 5],
              confirmationCountMax: 1
            })

            expect(result).to.eql(false)
          })
        })

        describe('and amount of values after cross over is less than or equal to confirmationCountMax', () => {
          it('returns true', async () => {
            const result = await fact.value({
              series1: [1, 1, 2, 4, 6],
              series2: [1, 1, 2, 3, 4],
              confirmationCountMax: 2
            })

            expect(result).to.eql(true)
          })
        })
      })
    })
  })
})
