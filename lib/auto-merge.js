const findPRWithRef = require('./utils/find-pr-with-ref')

const APPROVED = 'APPROVED'
const SUCCESS = 'success'

module.exports = async (context) => {
  const {
    github: {
      pullRequests,
      repos
    },
    payload: {
      description,
      repository,
      sha,
      state
    }
  } = context

  const owner = repository.owner.login
  const repo = repository.name

  if (state !== SUCCESS) {
    return context.log.info(`${description} state is "${state}", not merging.`)
  }

  const {
    data: {
      state: combinedStatusState
    }
  } = await repos.getCombinedStatusForRef({owner, repo, ref: sha})

  if (combinedStatusState !== SUCCESS) {
    return context.log.info(`Combined status for ${description} is "${combinedStatusState}", not merging.`)
  }

  const pr = await findPRWithRef(context, sha)

  if (!pr) {
    return context.log.info(`No PR related to commit ${sha} found.`)
  }

  const { number } = pr

  const reviews = await pullRequests.getReviews({ owner, repo, number, per_page: 100 })

  if (reviews.length !== 0) {
    return context.log.info(`PR #${number} isn't reviewed yet, not merging.`)
  }

  if (!reviews.every(review => review.state === APPROVED)) {
    return context.log.info(`PR #${number} isn't approved by all reviewers yet. Not merging.`)
  }

  if (!pr.data.mergeable) {
    return context.log.info(`PR #${number} isn't mergeable`)
  }

  await pullRequests.merge({owner, repo, number, sha})
  return context.log.info(`Merged PR #${number}`)
}
