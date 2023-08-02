const { expect } = require('../../helpers')
const CrossDown = require('../../../lib/facts/ta/crossDown')

describe('Fact ta.crossDown', () => {
  describe('#value', () => {
    const fact = new CrossDown()

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
            series1: [5, 3, 3, 2, 2],
            series2: [5, 4, 3, 3, 3]
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
            series1: [5, 3, 3, 2, 2],
            series2: [5, 4, 3, 3, 3]
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
          series1: [5, 4, 3, 2, 1],
          series2: [5, 4, 3, 2, 1],
          requiredValuesBelow: 0
        })

        expect(result).to.eql(false)
      })
    })

    describe('when a cross under occurs in the first period', () => {
      it('returns false', async () => {
        const result = await fact.value({
          series1: [4, 4, 3, 2, 1],
          series2: [5, 4, 3, 2, 1],
          requiredValuesBelow: 0
        })

        expect(result).to.eql(false)
      })
    })

    describe('when there is a cross under', () => {
      describe('and not all of the remaining values are greater than or equal to cross under itself', () => {
        it('returns false', async () => {
          const result = await fact.value({
            series1: [5, 4, 5, 4, 5],
            series2: [5, 5, 4, 4, 3]
          })

          expect(result).to.eql(false)
        })
      })

      describe('and all of the remaining values are less than or equal to cross under itself', () => {
        it('returns true', async () => {
          const result = await fact.value({
            series1: [5, 4, 3, 2, 1],
            series2: [5, 5, 4, 4, 3],
            requiredValuesBelow: 0
          })

          expect(result).to.eql(true)
        })
      })

      describe('and confirmationCountMin is set', () => {
        describe('and is 0', () => {
          it('returns true', async () => {
            const result = await fact.value({
              series1: [5, 4, 3, 2, 1],
              series2: [5, 5, 4, 4, 3],
              confirmationCountMin: 0
            })

            expect(result).to.eql(true)
          })
        })

        describe('and amount of values after (and including) cross under is less than confirmationCountMin', () => {
          it('returns false', async () => {
            const result = await fact.value({
              series1: [5, 5, 4, 2, 1],
              series2: [5, 5, 4, 4, 3],
              confirmationCountMin: 3
            })

            expect(result).to.eql(false)
          })
        })

        describe('and amount of values after (and including) cross under is greater than or equal to confirmationCountMin', () => {
          it('returns true', async () => {
            const result = await fact.value({
              series1: [5, 5, 4, 2, 1],
              series2: [5, 5, 4, 4, 3],
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
              series1: [5, 4, 3, 2, 1],
              series2: [5, 5, 4, 4, 3],
              confirmationCountMax: 0
            })

            expect(result).to.eql(true)
          })
        })

        describe('and amount of values after (and including) cross under is greater than confirmationCountMax', () => {
          it('returns false', async () => {
            const result = await fact.value({
              series1: [5, 4, 3, 2, 1],
              series2: [5, 5, 4, 4, 3],
              confirmationCountMax: 1
            })

            expect(result).to.eql(false)
          })
        })

        describe('and amount of values after (and including) cross under is less than or equal to confirmationCountMax', () => {
          it('returns true', async () => {
            const result = await fact.value({
              series1: [5, 4, 3, 2, 1],
              series2: [5, 5, 4, 4, 3],
              confirmationCountMin: 2
            })

            expect(result).to.eql(true)
          })
        })
      })
    })
  })
})
