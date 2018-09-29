/**
 * Retrieves auto-merge strategy
 *
 * @param {probot.Context} context Context argument from a Probot .on() hook.
 *
 *  @returns {Object} the auto merge strategy
 */

const getStrategy = async (context) => {
    try {
      const { data } = await context.github.search.issues({q: `${ref}+type:pr`})
  
      if (!data || !data.items.length) {
        return null
      }
  
      const number = data.items[0].number
  
      const [owner, repo] = data.items[0].pull_request.url.match(/\/repos\/(.*)\/pulls/)[1].split('/')
      const { data: pullRequest } = await context.github.pullRequests.get({owner, repo, number})
  
      return pullRequest
    } catch (e) {
      return null
    }
  }
  
  module.exports = getStrategy
  