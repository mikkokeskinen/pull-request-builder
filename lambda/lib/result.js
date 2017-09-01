const AWS = require('aws-sdk')
AWS.config.update({region: process.env.AWS_REGION})
const codebuild = new AWS.CodeBuild()
const status = require('./status')
const promiseRetry = require('promise-retry');

const statuses = {
  'PENDING': 'pending',
  'IN_PROGRESS': 'pending',
  'FAILED': 'failure',
  'SUCCEEDED': 'success',
  'ERROR': 'error'
}

function greenStatus (buildId) {
  return new Promise((resolve, reject) => {
    codebuild.batchGetBuilds({ ids: [ buildId ] }, (err, data) => {
      if (err)
      {
        console.log("==> unable to fetch build", JSON.stringify(err))
        reject(false)
      } else {
        var build = data.builds[0]
        if (build.buildStatus == 'SUCCEEDED' || build.buildStatus == 'FAILED') {
          resolve(build)
        } else {
          reject(false)
        }
      }
    })
  })
}



module.exports.run = (buildId, comment) => {
  return promiseRetry(function (retry, number) {
    console.log('attempt number', number);
    return greenStatus(buildId)
      .catch(retry);
  }).then(function (build) {
      const buildStatus = statuses[build.buildStatus]
      return status.update(buildStatus, '**ci/cd**', build, comment)
    }, function (err) {
      return err
    })

}
