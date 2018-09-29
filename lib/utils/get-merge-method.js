/**
 * Gets the merge_method from the config file. Defaults to 'merge'
 * Accepts merge/squash/rebase
 *
 * @param {object} config A plain object with config values
 *
 * @returns {string} The merge_method from the config
 */

const DEFAULT_MERGE_METHOD = 'merge'
const AVAILABLE_MERGE_METHODS = ['merge', 'squash', 'rebase']

const getMergeMethod = ({ merge_method = DEFAULT_MERGE_METHOD }) => {
  if (AVAILABLE_MERGE_METHODS.includes(merge_method)) {
    return merge_method
  }

  return DEFAULT_MERGE_METHOD
}

module.exports = getMergeMethod
