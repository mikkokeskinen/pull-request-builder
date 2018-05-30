// @doc
//   GitHub Pull Request check pipeline
import {
  buildUrl,
  buildStatus,
  buildRepo,
  buildCommit,
  checkspec
} from './codebuild'
import {
  pending,
  success,
  failure
} from './github'

//
//
export const before = async json => (
  (json.pull_request && (json.action == 'opened' || json.action == 'synchronize'))
    ? initiate(json)
    : undefined
)

//
//
export const after = async json => (
  (json.source.buildspec === "checkspec.yml")
    ? complete(json)
    : undefined
)

//
//
const initiate = async json => {
  console.log("\n\n ====== initiate: check spec ======= \n\n")

  const codebuild = await checkspec(json.repository.full_name, json.pull_request.number, json.pull_request.head.sha)
  console.log("==> build pending", JSON.stringify(codebuild))

  const github = await pending(json.repository.full_name, json.pull_request.head.sha, buildUrl(codebuild.build))
  console.log("==> github", JSON.stringify(github))
}

//
//
const complete = async json => {
  console.log("\n\n ====== complete: check spec ======= \n\n")

  const status = buildStatus(json)
  if (status.success) {
    const github = await success(buildRepo(json), buildCommit(json), buildUrl(json), status.message)
    console.log("==> github", JSON.stringify(github))
  } else {
    const github = await failure(buildRepo(json), buildCommit(json), buildUrl(json), status.message)
    console.log("==> github", JSON.stringify(github))
  }
}
