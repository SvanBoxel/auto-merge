const cacheManager = require('cache-manager');
const memoryCache = cacheManager.caching({
  store: 'memory', 
  max: 100, 
  ttl: 10/*seconds*/
});

const withConfig = async (context, options) => {
  if (options.disableCache) {
    return async (func) => func(await context.config('auto-merge-settings.yml'))
  }

  const owner = context.payload.repository.owner.login
  const repo = context.payload.repository.name
  const slug = `${owner}/${repo}`

  try {
    const config = await memoryCache.get(slug)
    if (config) {
      return config
    }
  } catch (e) {

  } 
  
  const config = await context.config('auto-merge-settings.yml')
  memoryCache.set(slug, config);
  return (func) => func(config)
}

module.exports = withConfig
