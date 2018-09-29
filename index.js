const autoMerge = require('./lib/auto-merge')

module.exports = app => {
  app.log('Loaded auto-merge GitHub Application')
  app.on(['pull_request_review.submitted', 'status'], autoMerge)
}
