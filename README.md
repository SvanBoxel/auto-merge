[![Build Status](https://travis-ci.com/SvanBoxel/auto-merge.svg?branch=master)](https://travis-ci.com/SvanBoxel/auto-merge)
[![codecov](https://codecov.io/gh/SvanBoxel/auto-merge/branch/master/graph/badge.svg)](https://codecov.io/gh/SvanBoxel/auto-merge)

# auto-merge

> A GitHub App built with [Probot](https://probot.github.io) that automatically merges your PR when everything is green.

## How it works
Code reviews often rely on three aspects: The submitter of the PR, the reviewers, and CI. Writing the code, submitting the PR, and reviewing the PR is a manual process that needs human eyes and brains. The process of CI, however, is something we automate for a reason. It is the place where we do sanity checks and make sure nothing terrible happens to our beautiful software projects. And for a good reason.  

Because of this, the following situation can arise: You as a developer developed a new feature and submitted a PR. After some back-and-forth with your team members, the PR gets approved. The only dependency now is the not-so-fast CI, which is still running on your PR. This forces you to revisit your PR later that day to check if CI is green so that you can click the merge button. 

This app does exactly that for you. As soon as your PR is approved, and CI passes, the PR gets merged automatically.

> The current iteration of the app only takes care of the above scenario. The app doesn't directly merge a PR after one or more reviewers approve it. It only auto-merges an approved PR that needs to wait for CI. 

This app also adheres to your branch (protection) settings. e.g., if you require at least two reviewers, it won't auto-merge the PR if only one reviewer approves it.

## Configuration

## Setup

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

[ISC](LICENSE) © 2018 Sebass van Boxel <svboxel@gmail.com>
