/**
 * Gets the merge_method from the config file. Defaults to 'merge'
 * Accepts merge/squash/rebase
 * 
 * @param {probot.Context} context Context argument from a Probot .on() hook.
 * 
 * @returns {string} The merge_method from the config
 */
 
const DEFAULT_MERGE_METHOD = 'merge'
const AVAILABLE_MERGE_METHODS = ['merge', 'squash', 'rebase']

const getMergeMethod = async (context) => {
    const { merge_method } = await context.config('auto-merge-settings.yml', {
        merge_method: DEFAULT_MERGE_METHOD
    })

    if (AVAILABLE_MERGE_METHODS.includes(merge_method)) {
        return merge_method
    }

    return DEFAULT_MERGE_METHOD
}

module.exports = getMergeMethod