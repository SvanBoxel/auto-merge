const { Application } = require('probot')
const plugin = require('../index')
const autoMerge = require('../lib/auto-merge')
const issueOpenedEventPayload = require('./fixtures/issues.opened.json')
const statusEventPayload = require('./fixtures/status')

jest.mock('../lib/auto-merge', (context) => jest.fn())

describe('auto-merge Probot Application', () => {
  let app
  let github

  beforeEach(() => {
    app = new Application()
    app.load(plugin)
    app.auth = () => Promise.resolve(github)
  })

  describe('Delete branch functionality', () => {
    describe('It does not receive the `status` event', () => {
      beforeEach(async () => {
        const event = 'issue.open'
        await app.receive({ event, payload: issueOpenedEventPayload })
      })

      it('should NOT call the autoMerge method', () => {
        expect(autoMerge).not.toHaveBeenCalled()
      })
    })

    describe('It receives the `status` event', () => {
      beforeEach(async () => {
        const event = 'status'
        await app.receive({ event, payload: statusEventPayload })
      })

      it('should call the autoMerge method', () => {
        expect(autoMerge).toHaveBeenCalled()
      })
    })
  })
})
