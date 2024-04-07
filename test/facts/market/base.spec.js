const { expect, chance } = require('../../helpers')
const Base = require('../../../lib/facts/market/base')

describe('Fact market.base', () => {
  describe('#value', () => {
    const fact = new Base()

    describe('params', () => {
      describe('market', () => {
        it('is required', async () => {
          let thrownErr = null

          try {
            await fact.value()
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('market is required')
        })

        it('must be a string', async () => {
          let thrownErr = null

          try {
            await fact.value({ market: chance.bool() })
          } catch (err) {
            thrownErr = err
          }

          expect(thrownErr.type).to.eql('VALIDATION_ERROR')
          expect(thrownErr.data[0].message).to.eql('market must be a string')
        })
      })
    })

    it('returns the base symbol', async () => {
      const result = await fact.value({ market: 'BTC/USD' })

      expect(result).to.eql('BTC')
    })
  })
})
