// @doc
//   GitHub Pull tags deploy pipeline
import {
  buildUrl,
  buildStatus,
  buildRepo,
  buildPR,
  carryspec
} from './codebuild'

import {
  comment,
  raiseIssue,
  closeIssue
} from './github'

//
//
export const before = async json => (
  (json.ref && json.ref.startsWith('refs/tags'))
    ? initiate(json)
    : undefined
)

//
//
export const after = async json => (
  (json.source.buildspec === "carryspec.yml")
    ? complete(json)
    : undefined
)

//
//
const initiate = async json => {
  console.log("\n\n ====== initiate: carry spec ======= \n\n")

  const rel = json.ref.replace('refs/tags/', '')
  const issue = await raiseIssue(json.repository.full_name, `release ${rel} to live`)
  console.log("==> issue", JSON.stringify(issue))

  const pr = issue.response.body.number
  const codebuild = await carryspec(json.repository.full_name, pr, json.after)
  console.log("==> build pending", JSON.stringify(codebuild))

  const message = `**ci/cd**: [pending](${buildUrl(codebuild.build)})\n\n`
  const github = await comment(json.repository.full_name, pr, message)
  console.log("==> github", JSON.stringify(github))
}

//
//
const complete = async json => {
  console.log("\n\n ====== complete: carry spec ======= \n\n")

  const status = buildStatus(json)
  if (status.success) {
    const message = `**ci/cd**: [success](${buildUrl(json)})\n\n${status.message}`
    const github = await comment(buildRepo(json), buildPR(json), message)
    console.log("==> github", JSON.stringify(github))
    const issue  = await closeIssue(buildRepo(json), buildPR(json))
    console.log("==> issue", JSON.stringify(issue))
  } else {
    const message = `**ci/cd**: [failure](${buildUrl(json)})\n\n${status.message}`
    const github = await comment(buildRepo(json), buildPR(json), message)
    console.log("==> github", JSON.stringify(github))
  }
}
