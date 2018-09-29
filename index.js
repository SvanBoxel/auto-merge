const autoMerge = require('./lib/auto-merge')

module.exports = app => {
  app.log('Loaded auto-merge GitHub Application')
  app.on('status', autoMerge)
}
