// @doc
//   GitHub API helpers
import GitHub from 'octocat'

const github = new GitHub({ token: process.env.GITHUB_TOKEN })

//
//
export const pending = (repo, commit, url) => (
  github
    .repo(repo)
    .createStatus(commit, {
      state: 'pending',
      target_url: url,
      description: '**ci/cd**'
    })
)

//
//
export const success = (repo, commit, url, message) => (
  github
    .repo(repo)
    .createStatus(commit, {
      state: 'success',
      target_url: url,
      description: message
    })
)

//
//
export const failure = (repo, commit, url, message) => (
  github
    .repo(repo)
    .createStatus(commit, {
      state: 'failure',
      target_url: url,
      description: message
    })
)

//
//
export const comment = (repo, issue, message) => (
  github
    .post(`/repos/${repo}/issues/${issue}/comments`, {body: message})
)

//
//
export const raiseIssue = (repo, title) => (
  github
    .post(`/repos/${repo}/issues`, {title})
)

//
//
export const closeIssue = (repo, issue) => (
  github
    .patch(`/repos/${repo}/issues/${issue}`, {state: 'closed'})
)
