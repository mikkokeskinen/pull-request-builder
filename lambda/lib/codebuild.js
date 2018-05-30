// @doc
//   AWS CodeBuild helpers
import AWS from 'aws-sdk'

AWS.config.update({ region: process.env.AWS_REGION })
const codebuild = new AWS.CodeBuild()

//
//
export const buildUrl = (build) => (
  `https://console.aws.amazon.com/codebuild/home?region=${process.env.AWS_REGION}#/builds/${build.id}/view/new`
)

//
//
export const buildStatus = (build) => {
  const fails = build.phases.filter(x => x.phaseStatus && x.phaseStatus !== "SUCCEEDED")
  const phases = build.phases.filter(x => x.phaseType === "BUILD")

  if (fails.length > 0) {
    const message = `build failed ${fails[0].contexts[0].statusCode}: ${fails[0].contexts[0].message}`
    return {success: false, message}
  } else if (phases.length > 0) {
    const message = `build duration ${phases[0].durationInSeconds} seconds`
    return {success: true, message}
  } else {
    const message = 'build failed'
    return {success: false, message}
  }
}

//
//
export const buildRepo = (build) => (
  build.source.location.replace('https://github.com/', '')
)

//
//
export const buildCommit = (build) => (
  build.environment.environmentVariables.filter(x => x.name === 'GIT_COMMIT')[0].value
)

//
//
export const buildPR = (build) => (
  build.environment.environmentVariables.filter(x => x.name === 'GIT_PR')[0].value
)

//
//
export const fetchBuild = async (id) => (
  codebuild
    .batchGetBuilds({ ids: [id] })
    .promise()
    .then(x => x.builds[0])
)

//
//
export const checkspec = async (repo, pr, commit) => (
  codebuild
    .startBuild({
      projectName: repo.replace('/', '-'),
      artifactsOverride: { type: 'NO_ARTIFACTS' },
      sourceVersion: `pr/${pr}`,
      environmentVariablesOverride: [
        {name: 'GIT_PR', value: `${pr}`},
        {name: 'GIT_COMMIT', value: commit}
      ],
      buildspecOverride: 'checkspec.yml'
    })
    .promise()
)

//
//
export const buildspec = async (repo, pr, commit) => (
  codebuild
    .startBuild({
      projectName: repo.replace('/', '-'),
      artifactsOverride: { type: 'NO_ARTIFACTS' },
      sourceVersion: commit,
      environmentVariablesOverride: [
        {name: 'GIT_PR', value: `${pr}`},
        {name: 'GIT_COMMIT', value: commit}
      ],
      buildspecOverride: 'buildspec.yml'
    })
    .promise()
)

//
//
export const carryspec = async (repo, pr, commit) => (
  codebuild
    .startBuild({
      projectName: repo.replace('/', '-'),
      artifactsOverride: { type: 'NO_ARTIFACTS' },
      sourceVersion: commit,
      environmentVariablesOverride: [
        {name: 'GIT_PR', value: `${pr}`},
        {name: 'GIT_COMMIT', value: commit}
      ],
      buildspecOverride: 'carryspec.yml'
    })
    .promise()
)
