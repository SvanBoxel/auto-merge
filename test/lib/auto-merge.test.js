const autoMerge = require('../../lib/auto-merge')
const withConfig = require('../../lib/utils/with-config')
const findPRWithRef = require('../../lib/utils/find-pr-with-ref')
const statusEventPayload = require('../fixtures/status.json')
const getPullRequestResponse = require('../fixtures/pull_request.json')
const getReviewsResponse = require('../fixtures/get_reviews.json')

jest.mock('../../lib/utils/find-pr-with-ref', () => jest.fn())
jest.mock('../../lib/utils/with-config', () => jest.fn())

describe('autoMerge function', () => {
  let context
  let getCombinedStatus
  let getPullRequest
  let getReviews
  let merge_method
  let strategy

  beforeEach(() => {
    getCombinedStatus = jest.fn().mockReturnValue(Promise.resolve({ data: {} }))
    getPullRequest = jest.fn().mockReturnValue(Promise.resolve(getPullRequestResponse))
    getReviews = jest.fn().mockReturnValue(Promise.resolve(getReviewsResponse))
    context = {
      log: {
        info: jest.fn(),
        warn: jest.fn()
      },
      payload: JSON.parse(JSON.stringify(statusEventPayload)),
      github: {
        issues: {
          edit: jest.fn()
        },
        repos: {
          getCombinedStatusForRef: getCombinedStatus
        },
        pullRequests: {
          get: getPullRequest,
          getReviews,
          merge: jest.fn()
        }
      }
    }

    merge_method = 'squash'
    strategy = 'all'
    withConfig.mockReturnValue((func) => func({ merge_method, strategy }))
  })

  describe('status state is NOT "success"', () => {
    beforeEach(() => {
      context.payload.state = 'pending'
      autoMerge(context)
    })

    it('should log cannot merge the branch', () => {
      expect(context.log.info).toBeCalledWith(`"${context.payload.description}" state is "${context.payload.state}", not merging.`)
    })
  })

  describe('status state is "success"', () => {
    beforeEach(() => {
      context.payload.state = 'success'
      autoMerge(context)
    })

    describe('getCombinedStatusForRef method does NOT return "success"', () => {
      let state

      beforeEach(async () => {
        state = 'pending'
        getCombinedStatus.mockReturnValue(Promise.resolve({ data: { state } }))
        await autoMerge(context)
      })

      it('should log cannot merge the branch', () => {
        expect(context.log.info).toBeCalledWith(`Combined status for "${context.payload.description}" is "${state}", not merging.`)
      })
    })

    describe('getCombinedStatusForRef method does return "success"', () => {
      let state

      beforeEach(async () => {
        state = 'success'
        getCombinedStatus.mockReturnValue(Promise.resolve({ data: { state } }))
      })

      describe('findPRWithRef method does return null', () => {
        beforeEach(async () => {
          findPRWithRef.mockReturnValue(null)
          await autoMerge(context)
        })

        it('should log no PRs are related to this branch', () => {
          expect(context.log.info).toBeCalledWith(`No PR related to commit "${context.payload.sha}" found.`)
        })
      })

      describe('findPRWithRef method returns a PR', () => {
        beforeEach(() => {
          findPRWithRef.mockReturnValue(getPullRequestResponse.data)
        })

        describe('label strategy is active and no auto-merge label is applied', () => {
          beforeEach(async () => {
            withConfig.mockReturnValue((func) => func({ merge_method, strategy: 'label' }))
            await autoMerge(context)
          })

          it('should log that label strategy is active and no "auto-merge"-label is found', () => {
            expect(context.log.info).toBeCalledWith(`Label strategy active, no \"auto-merge\"-label found on PR #${getPullRequestResponse.data.number}.`)
          })
        })

        describe('PR does NOT have any reviewers assigned', () => {
          beforeEach(async () => {
            context.github.pullRequests.getReviews.mockReturnValue(Promise.resolve({ data: [] }))
            await autoMerge(context)
          })

          it('should log no reviewers are assigned', () => {
            expect(context.log.info).toBeCalledWith(`PR #${getPullRequestResponse.data.number} isn't reviewed yet, not merging.`)
          })
        })

        describe('PR is NOT approved by all reviewers', () => {
          beforeEach(async () => {
            const reviews = [
              getReviewsResponse.data[0],
              {
                ...getReviewsResponse.data[1],
                state: 'PENDING'
              }
            ]

            context.github.pullRequests.getReviews.mockReturnValue({ data: reviews })
            await autoMerge(context)
          })

          it('should log PR isn\'t approved by all reviewers', () => {
            expect(context.log.info).toBeCalledWith(`PR #${getPullRequestResponse.data.number} isn't approved by all reviewers yet. Not merging.`)
          })
        })

        describe('PR is approved by all reviewers', () => {
          beforeEach(() => {
            context.github.pullRequests.getReviews.mockReturnValue(getReviewsResponse)
          })

          describe('PR is NOT mergeable', () => {
            beforeEach(async () => {
              findPRWithRef.mockReturnValue({
                ...getPullRequestResponse.data,
                mergeable: false
              })

              await autoMerge(context)
            })

            it('should log that the PR isn\'t mergeable', () => {
              expect(context.log.info).toBeCalledWith(`PR #${getPullRequestResponse.data.number} isn't mergeable`)
            })
          })

          describe('PR is mergeable', () => {
            beforeEach(async () => {
              findPRWithRef.mockReturnValue({
                ...getPullRequestResponse.data,
                mergeable: true
              })

              await autoMerge(context)
            })

            it('should call the merge method', () => {
              expect(context.github.pullRequests.merge).toBeCalledWith({
                owner: context.payload.repository.owner.login,
                repo: context.payload.repository.name,
                number: getPullRequestResponse.data.number,
                sha: context.payload.sha,
                merge_method
              })
            })

            it('should close the pr', () => {
              expect(context.github.issues.edit).toBeCalledWith({
                owner: context.payload.repository.owner.login,
                repo: context.payload.repository.name,
                number: getPullRequestResponse.data.number,
                state: 'closed'
              })
            })

            it('should log the merge method', () => {
              expect(context.log.info).toBeCalledWith(`Merged PR #${getPullRequestResponse.data.number}`)
            })
          })
        })
      })
    })
  })
})
