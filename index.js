const autoMerge = require('./lib/auto-merge')
const withConfig = require('./lib/utils/with-config')

module.exports = app => {
  app.log('Loaded auto-merge GitHub Application')
  app.on(['pull_request_review.submitted', 'status'], (context) => {
    const config = withConfig(context)(({ auto_merge_on = ['status', 'review']} ) => auto_merge_on)
    console.log(config);
    autoMerge(context);
  })
}
