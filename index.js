const APPROVED = 'APPROVED';
const SUCCESS = 'success';

module.exports = app => {
  app.log('Yay, the app was loaded!')

  app.on('status', async context => {
    const { 
      github: {
        pullRequests,
        repos,
        search,
      },
      payload: { 
        description, 
        repository, 
        sha, 
        state, 
      }, 
    } = context;

    const owner = repository.owner.login
    const repo = repository.name

    if (state !== SUCCESS) {
      context.log.info(`${description} state is "${state}", not merging.`)
      return
    }

    const { 
      data: { 
        state: combinedStatusState
       } 
      } = await repos.getCombinedStatusForRef({owner, repo, ref: sha})

    if (combinedStatusState !== SUCCESS) {
      context.log.info(`Combined status for ${description} is "${combinedState}", not merging.`)
      return
    }

    const result = await search.issues({q: `${sha}+type:pr`})
    const number = result.data.items[0].number

    const pr = await pullRequests.get({owner, repo, number})

    const reviews = await pullRequests.getReviews({ owner, repo, number, per_page: 100 })

    if (reviews.length !== 0) {
      context.log.info(`PR #${number} isn't reviewed yet, not merging.`)
      return
    }

    if (!reviews.every(review => review.state === APPROVED)) {
      context.log.info(`PR #${number} isn't approved by all reviewers yet. Not merging.`)
      return
    }

    if (pr.data.mergeable) {
      context.log.info(`Merging PR #${number}`)
      await pullRequests.merge({owner, repo, number, sha})
      return
    }

    return
  })
}
