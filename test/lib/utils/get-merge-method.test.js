const getMergeMethod = require('../../../lib/utils/get-merge-method')

describe('getMergeMethod function', () => {
  let merge_method
  beforeEach(() => {
    getConfig = jest.fn().mockReturnValue(Promise.resolve({}))
    context = {
      config: jest.fn().mockReturnValue(Promise.resolve({}))
    }
  })
  
  describe('config method returns available merge method', () => {
    beforeEach(() => {
      merge_method = 'rebase'
      context.config = jest.fn().mockReturnValue(Promise.resolve({ merge_method }))
    })

    it('should return that merge_method', async () => {
      const result = await getMergeMethod(context)
      expect(result).toBe(merge_method)
    })
  })

  describe('config method returns unavailable merge method', () => {
    beforeEach(() => {
      merge_method = 'foobar'
      context.config = jest.fn().mockReturnValue(Promise.resolve({ merge_method }))
    })

    it('should return "merge"', async () => {
      const result = await getMergeMethod(context)
      expect(result).toBe('merge')
    })
  })
})
