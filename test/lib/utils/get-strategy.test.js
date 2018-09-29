const getStrategy = require('../../../lib/utils/get-strategy')

describe('getStrategy function', () => {
  let strategy
  describe('config method returns available strategy', () => {
    beforeEach(() => {
      strategy = 'all'
    })
    
    it('should return that strategy', () => {
      const result = getStrategy({ strategy })
      expect(result).toBe(strategy)
    })
  })
  
  describe('config method returns unavailable strategy', () => {
    beforeEach(() => {
      strategy = 'foobar'
    })
    
    it('should return "label"', () => {
      const result = getStrategy({ strategy })
      expect(result).toBe('label')
    })
  })
})
