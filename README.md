[![Build Status](https://travis-ci.com/SvanBoxel/auto-merge.svg?branch=master)](https://travis-ci.com/SvanBoxel/auto-merge)
[![codecov](https://codecov.io/gh/SvanBoxel/auto-merge/branch/master/graph/badge.svg)](https://codecov.io/gh/SvanBoxel/auto-merge)
[![SonarCloud](https://sonarcloud.io/api/project_badges/measure?project=SvanBoxel_auto-merge&metric=alert_status)](https://sonarcloud.io/dashboard?id=SvanBoxel_auto-merge) [![Greenkeeper badge](https://badges.greenkeeper.io/SvanBoxel/auto-merge.svg)](https://greenkeeper.io/)

# Auto Merge PRs
A nifty little app built with [Probot](https://probot.github.io) that automatically merges your PRs when everything is green so you don't have to. 

## How it works
Code reviews often rely on three aspects: The submitter of the PR, the reviewers, and CI. Writing the code, submitting the PR, and reviewing the PR is a manual process that needs human eyes and brains. The process of CI, however, is something we automate for a reason. It is the place where we do sanity checks and make sure nothing terrible happens to our beautiful software projects. And for a good reason.  

Because of this, the following situation can arise: You as a developer developed a new feature and submitted a PR. After some back-and-forth with your team members, the PR gets approved. The only dependency now is the not-so-fast CI, which is still running on your PR. This forces you to revisit your PR later that day to check if CI is green so that you can click the merge button. 

This app does exactly that for you. As soon as your PR is approved, and CI passes, the PR gets merged automatically.

> The current iteration of the app also auto-merges when CI already is green and a reviewer approves your PR _after_ that. The bottem-line is that the moment everything turns green (Status checks, reviewers and other enforced branch protection rules), this app merges your PR. 

This app also adheres to your branch (protection) settings. e.g., if you require at least two reviewers, it won't auto-merge the PR if only one reviewer approves it.

## Configuration
In 3 steps this app can be used in your project.

1. Go to [GitHub Apps](https://github.com/apps/auto-merge) and install this ProBot app.
2. _(optional but recommended)_ create a `.github/auto-merge-settings.yml` file. (see template below) This config file supports two options:
    - **merge_method** 
    `merge`/`squash`/`rebase`, default: `merge`, [more info](https://help.github.com/articles/about-merge-methods-on-github/)
    - **strategy**: `all`/`label`, default: `label`, apply this auto-merge functionality to all PRs, or only the PR with a `auto-merge` label
3. Open a pull request and add the `auto-merge` label to your PR. (not needed if strategy is `all`)

```YAML
merge_method: 'squash' # merge/squash/rebase
strategy: 'label' # all/label
```

## Running it locally
1. First, follow [these instructions](https://probot.github.io/docs/development/#configure-a-github-app) for making your own GitHub app.

Give your app the following permissions:

| Category            | Permission   | Why                   |
|---------------------|--------------|-----------------------|
| Repository contents | Read & Write | to perform merges     |
| Repository metadata | Read         | to read config file   |
| Pull Requests       | Read         | to read labels        |
| Commit Statuses     | Read         | to read status checks |

2. Then, clone the repo:
```sh
git clone git@github.com:SvanBoxel/auto-merge.git
```

3. Copy `.env.example` to `.env` and set the right environment variables as [here](https://probot.github.io/docs/development/#configure-a-github-app) 

4. Now, install app dependencies and run it:

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Contributing

If you have suggestions for how auto-merge could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 Sebass van Boxel <hello@svboxel.com>
