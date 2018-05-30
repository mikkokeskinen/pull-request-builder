// @doc
//   GitHub Pull Request build pipeline
import {
  buildUrl,
  buildStatus,
  buildRepo,
  buildPR,
  buildspec
} from './codebuild'

import { comment } from './github'

//
//
export const before = async json => (
  (json.ref && json.ref.startsWith('refs/heads/master') && json.head_commit)
    ? initiate(json)
    : undefined
)

//
//
export const after = async json => (
  (json.source.buildspec === "buildspec.yml")
    ? complete(json)
    : undefined
)

//
//
const initiate = async json => {
  console.log("\n\n ====== initiate: build spec ======= \n\n")

  // Note: GitHub commit message for merged PR
  //       "Merge pull request #48 from ...\n\n..."
  const pr = json.head_commit.message.match(/#\d+/)[0].substring(1)
  const codebuild = await buildspec(json.repository.full_name, pr, json.after)
  console.log("==> build pending", JSON.stringify(codebuild))

  const message = `**ci/cd**: [pending](${buildUrl(codebuild.build)})\n\n`
  const github = await comment(json.repository.full_name, pr, message)
  console.log("==> github", JSON.stringify(github))
}

//
//
const complete = async json => {
  console.log("\n\n ====== complete: build spec ======= \n\n")
  const status = buildStatus(json)

  if (status.success) {
    const message = `**ci/cd**: [success](${buildUrl(json)})\n\n${status.message}`
    const github = await comment(buildRepo(json), buildPR(json), message)
    console.log("==> github", JSON.stringify(github))
  } else {
    const message = `**ci/cd**: [failure](${buildUrl(json)})\n\n${status.message}`
    const github = await comment(buildRepo(json), buildPR(json), message)
    console.log("==> github", JSON.stringify(github))
  }
}
