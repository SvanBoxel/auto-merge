/**
* Gets the strategy prop from the config file. Defaults to 'label'
* Accepts all/label
*
* @param {object} config A plain object with config values
*
* @returns {string} The strategy from the config
*/

const DEFAULT_STRATEGY = 'label'
const AVAILABLE_STRATEGIES = ['all', 'label']

const getStrategy = ({ strategy = DEFAULT_STRATEGY }) => {
  if (AVAILABLE_STRATEGIES.includes(strategy)) {
    return strategy
  }

  return DEFAULT_STRATEGY
}

module.exports = getStrategy
