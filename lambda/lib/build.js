const AWS = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION});
const codebuild = new AWS.CodeBuild()
const status = require('./status')

//
//
module.exports.pull_request = (repo, id) => {
  return new Promise((accept, reject) => {

    var job = {
      projectName: repo.replace('/', '-'),
      artifactsOverride: { type: 'NO_ARTIFACTS' },
      sourceVersion: id
    }

    if (id.startsWith('pr/'))
    {
      job.buildspecOverride = 'checkspec.yml'
    }

    codebuild.startBuild(job)
    .promise()
    .then(x => {
      console.log("==> build pending", JSON.stringify(x))
      return status.update('pending', '**ci/cd**', x.build)
    })
    .then(x => {
      console.log("==> github status", JSON.stringify(x))
      accept(x)
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })

  })
}


module.exports.commit = (repo, id) => {

  return new Promise((accept, reject) => {

    codebuild.startBuild({
      projectName: repo.replace('/', '-'),
      artifactsOverride: { type: 'NO_ARTIFACTS' },
      sourceVersion: id
    })
    .promise()
    .then(x => {
        console.log("==> build pending", JSON.stringify(x))
        return status.update('pending', '**ci/cd**', x.build)
    })
    .then(x => {
      console.log("==> github status", JSON.stringify(x))
      accept(x)
    })
    .catch(err => {
      console.log(err)
      reject(err)
    })
  })

}
