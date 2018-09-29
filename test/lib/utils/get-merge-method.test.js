const getMergeMethod = require('../../../lib/utils/get-merge-method')

describe('getMergeMethod function', () => {
  let merge_method
  describe('config method returns available merge method', () => {
    beforeEach(() => {
      merge_method = 'rebase'
    })

    it('should return that merge_method', () => {
      const result = getMergeMethod({ merge_method })
      expect(result).toBe(merge_method)
    })
  })

  describe('config method returns unavailable merge method', () => {
    beforeEach(() => {
      merge_method = 'foobar'
    })

    it('should return "merge"', () => {
      const result = getMergeMethod({ merge_method })
      expect(result).toBe('merge')
    })
  })
})
