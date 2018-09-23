const findPRWithRef = require('../../../lib/utils/find-pr-with-ref')
const searchIssuesResponse = require('../../fixtures/search.json')
const getPullRequestResponse = require('../../fixtures/pull_request.json')

describe('findPRWithRef function', () => {
  let context
  let getPullRequest
  let issueSearch
  let ref

  beforeEach(() => {
    ref = 'e5bd3914e2e596debea16f433f57875b5b90bcd6'

    issueSearch = jest.fn().mockReturnValue(Promise.resolve(searchIssuesResponse))
    getPullRequest = jest.fn().mockReturnValue(Promise.resolve(getPullRequestResponse))
    context = {
      github: {
        search: {
          issues: issueSearch
        },
        pullRequests: {
          get: getPullRequest
        }
      }
    }
  })

  describe('PR is found', () => {
    it('should return the found PR', async () => {
      const result = await findPRWithRef(context, ref)
      expect(result).toBe(getPullRequestResponse.data)
    })
  })

  describe('PR is NOT found', () => {
    beforeEach(() => {
      const emptySearchIssuesResponse = {
        ...searchIssuesResponse,
        data: null
      }
      context.github.search.issues = jest.fn().mockReturnValue(Promise.resolve(emptySearchIssuesResponse))
    })

    it('should return null', async () => {
      const result = await findPRWithRef(context, ref)
      expect(result).toBe(null)
    })
  })

  describe('error is thrown in function', () => {
    beforeEach(() => {
      context.github.search.issues = jest.fn().mockReturnValue(Promise.reject(new Error('_')))
    })

    it('should return null', async () => {
      const result = await findPRWithRef(context, ref)
      expect(result).toBe(null)
    })
  })
})
