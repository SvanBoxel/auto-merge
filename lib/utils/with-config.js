const cacheManager = require('cache-manager');
const memoryCache = cacheManager.caching({
  store: 'memory', 
  max: 100
});

const default_ttl = 10

const withConfig = async (context, options = {}) => {
  if (options.disableCache) {
    const config = await context.config('auto-merge-settings.yml')
    return (func) => func(config)
  }

  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const slug = `${owner}/${repo}`

  try {
    const config = await memoryCache.get(slug)
    if (config) {
      return (func) => func(config)
    }
  } catch (e) {
    throw e
  } 
  
  const config = await context.config('auto-merge-settings.yml')
  memoryCache.set(slug, config, { ttl: options.ttl || default_ttl });
  return (func) => func(config)
}

module.exports = withConfig
