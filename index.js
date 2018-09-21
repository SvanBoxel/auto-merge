/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('status', async context => {
    const state = context.payload.state
    const statusDescription = context.payload.description
    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    const ref = context.payload.sha

    if (state !== 'success') {
      context.log.info(`${statusDescription} state is "${state}", not merging.`)
      return
    }

    const { data: { state: combinedState } } = await context.github.repos.getCombinedStatusForRef({owner, repo, ref})

    if (combinedState !== 'success') {
      context.log.info(`Combined status for ${statusDescription} is "${combinedState}", not merging.`)
    }

    const result = await context.github.search.issues({q: `${ref}+type:pr`})
    const number = result.data.items[0].number

    const pr = await context.github.pullRequests.get({owner, repo, number})

    const reviews = await context.github.pullRequests.getReviews({ owner, repo, number, per_page: 100 })

    if (reviews.length !== 0) {
      context.log.info(`PR #${number} isn't reviewed yet, not merging`)
    }

    if (!reviews.every(review => review.state === 'APPROVED')) {
      context.log.info(`PR #${number} isn't approved by all reviewers yet. Not merging`)
    }

    if (pr.data.mergeable) {
      context.log.info(`Merging PR #${number}`)
      await context.github.pullRequests.merge({owner, repo, number, sha: ref})
    }
  })
}
