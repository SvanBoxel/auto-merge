const faker = require('faker')
const withConfig = require('../../../lib/utils/with-config')

describe('getConfigProp function', () => {
  let config
  let context
  let options

  const extractConfig = async (context, options) => {
    const result = await withConfig(context, options)
    return result((config) => config)
  }

  beforeEach(() => {
    config = {
      a: faker.random.word(),
      b: faker.random.words(),
      c: faker.random.uuid()
    }

    getConfig = jest.fn().mockReturnValue(Promise.resolve({}))
    context = {
      payload: {
        repository: {
          name: faker.random.word(),
          owner: {
            login: faker.random.word()
          }
        }
      },
      config: jest.fn().mockReturnValue(Promise.resolve(config))
    }
  })

  describe('caching is disabled', () => {
    beforeEach(() => {
      options = {
        disableCache: true
      }
    })

    it('should return a function that returns the config object', async () => {
      const result = await extractConfig(context, options)
      expect(result).toBe(config)
    });

    it('should return an updated config object with changes', async () => {
      const result = await extractConfig(context, options)
      expect(result).toBe(config)
      
      const newConfig = { ...config }
      newConfig.b = faker.random.alphaNumeric();
      context.config = jest.fn().mockReturnValue(Promise.resolve(newConfig))
      const newResult = await extractConfig(context, options)
      expect(newResult).toBe(newConfig)
    });
  })

  describe('caching is enabled (default)', () => {
    it('should return the config object', async () => {
      const result = await extractConfig(context, options)
      expect(result).toBe(config)
    });

    it('should return the same config object without changes', async () => {
      const result = await extractConfig(context)
      expect(result).toBe(config)
      
      const newConfig = { ...config }
      newConfig.b = faker.random.alphaNumeric();
      context.config = jest.fn().mockReturnValue(Promise.resolve(newConfig))
      const newResult = await extractConfig(context)
      expect(newResult).toBe(config)
    });

    describe('cache is invalidated after ttl', () => {
      beforeEach(() => {
        options = {
          ttl: 1
        }
      })
      it('should return an updated config object with changes', async (done) => {
        const result = await extractConfig(context, options)
        expect.assertions(3)
        
        expect(result).toBe(config)
        
        const newConfig = { ...config }
        newConfig.b = faker.random.alphaNumeric();
        context.config = jest.fn().mockReturnValue(Promise.resolve(newConfig))

        setTimeout(async () => { // Shouldn't update after < 1s
          const newResult = await extractConfig(context, options)
          expect(newResult).toBe(config)
        }, 500);

        setTimeout(async () => { // Should update after > 1s
          const newResult = await extractConfig(context, options)
          expect(newResult).toBe(newConfig)
        }, 1500);

        setTimeout(done, 2000)
      });
    })
  })
})