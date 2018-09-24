const autoMerge = require('../../lib/auto-merge');
const findPRWithRef = require('../../lib/utils/find-pr-with-ref')
const statusEventPayload = require('../fixtures/status.json')
const searchIssuesResponse = require('../fixtures/search.json')
const getPullRequestResponse = require('../fixtures/pull_request.json')

jest.mock('../../lib/utils/find-pr-with-ref', () => jest.fn())

describe('autoMerge function', () => {
  let context
  let getPullRequest
  let getCombinedStatus
  
  beforeEach(() => {
    getCombinedStatus = jest.fn().mockReturnValue(Promise.resolve(searchIssuesResponse))
    getPullRequest = jest.fn().mockReturnValue(Promise.resolve(getPullRequestResponse))
    context = {
      log: {
        info: jest.fn(),
        warn: jest.fn()
      },
      payload: JSON.parse(JSON.stringify(statusEventPayload)),
      github: {
        pullRequests: {
          get: getPullRequest
        },
        repos: {
          getCombinedStatusForRef: getCombinedStatus
        }
      }
    }
  })
  
  describe('status state is NOT "success"', () => {
    beforeEach(() => {
      context.payload.state = 'pending';
      autoMerge(context)
    });
    
    it('should log cannot merge the branch', () => {
      expect(context.log.info).toBeCalledWith(`\"${context.payload.description}\" state is \"${context.payload.state}\", not merging.`)
    })
  })
  
  describe('status state is "success"', () => {
    beforeEach(() => {
      context.payload.state = 'success';
      autoMerge(context)
    });
    
    describe('getCombinedStatusForRef method does NOT return "success"', () => {
      let state;

      beforeEach(async () => {
        state = pending
        getCombinedStatus.mockReturnValue(Promise.resolve({ data: { state } } ))
        await autoMerge(context)
      });
      
      it('should log it didn\'t delete the branch', () => {
        expect(context.log.info).toBeCalledWith(`Combined status for \"${context.payload.description}\" is \"${state}\", not merging.`)
      })
    });
  })
})
