const cacheManager = require('cache-manager')
const memoryCache = cacheManager.caching({
  store: 'memory',
  max: 100
})

const default_ttl = 10

/**
*
* @param {probot.Context} context Context argument from a Probot .on() hook.
* @param {object} options
* @param {bool} [disableCache=false] Use cache, or not
* @param {int} [ttl=10] Time to life for cache. Ignored if disableCache option is set to true
*
* @returns {func} returns function with function
*/
const withConfig = async (context, options = {}) => {
  if (options.disableCache) {
    const config = await context.config('auto-merge-settings.yml')
    return (func) => func(config)
  }
  
  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const slug = `${owner}/${repo}`
  const cachedConfig = await memoryCache.get(slug)
  
  if (cachedConfig) {
    return (func) => func(cachedConfig)
  }
  
  const config = await context.config('auto-merge-settings.yml')
  memoryCache.set(slug, config, { ttl: options.ttl || default_ttl })
  return (func) => func(config)
}

module.exports = withConfig
