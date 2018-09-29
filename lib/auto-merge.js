const withConfig = require('./utils/with-config')
const findPRWithRef = require('./utils/find-pr-with-ref')
const getMergeMethod = require('./utils/get-merge-method')
const getStrategy = require('./utils/get-strategy')

const APPROVED = 'APPROVED'
const SUCCESS = 'success'
const AUTO_MERGE_LABEL = 'auto-merge'

module.exports = async (context) => {
  const {
    github: {
      pullRequests,
      repos
    },
    payload: {
      description,
      pull_request,
      repository,
      sha,
      state
    }
  } = context

  const owner = repository.owner.login
  const repo = repository.name

  if (state && state !== SUCCESS) {
    return context.log.info(`"${description}" state is "${state}", not merging.`)
  }

  const {
    data: {
      state: combinedStatusState
    }
  } = await repos.getCombinedStatusForRef({owner, repo, ref: sha})

  if (combinedStatusState !== SUCCESS) {
    return context.log.info(`Combined status for "${description}" is "${combinedStatusState}", not merging.`)
  }

  const pr = pull_request || await findPRWithRef(context, sha)

  if (!pr) {
    return context.log.info(`No PR related to commit "${sha}" found.`)
  }

  const { number, labels } = pr

  const configfy = await withConfig(context)
  const strategy = configfy(getStrategy)
  if (strategy === 'label' && !labels.find(({ name }) => name === AUTO_MERGE_LABEL)) {
    return context.log.info(`Label strategy active, no "auto-merge"-label found on PR #${number}.`)
  }

  const { data: reviews } = await pullRequests.getReviews({ owner, repo, number, per_page: 100 })

  if (!reviews || !reviews.length) {
    return context.log.info(`PR #${number} isn't reviewed yet, not merging.`)
  }

  if (!reviews.every(review => review.state === APPROVED)) {
    return context.log.info(`PR #${number} isn't approved by all reviewers yet. Not merging.`)
  }

  if (!pr.mergeable) {
    return context.log.info(`PR #${number} isn't mergeable`)
  }

  const merge_method = await configfy(getMergeMethod)
  await pullRequests.merge({ owner, repo, number, sha, merge_method })
  return context.log.info(`Merged PR #${number}`)
}
