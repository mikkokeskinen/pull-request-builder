'use strict';

const result = require('./lib/result')
const build = require('./lib/build')

exports.handler = (event, context, callback) => {

  const message = JSON.parse(event.Records[0].Sns.Message)

  console.log("\n\n ====== ci/cd action ======= \n\n")
  console.log("\n\n", JSON.stringify(message), "\n\n");

  if (message) 
  {
    if (message.pull_request && (message.action == 'opened' || message.action == 'synchronize')) {
      console.log("\n\n ====== pull request builder ======= \n\n")
      build
        .pull_request(message.repository.full_name, 'pr/' + message.pull_request.number)
        .then(x => {callback(null, x)})
        .catch(err => {callback(err, null)})

    } else if (message.after) {
      console.log("\n\n ====== code pipeline builder ======= \n\n")
      build
        .commit(message.repository.full_name, message.after)
        .then(x => {callback(null, x)})
        .catch(err => {callback(err, null)})

    } else {
      console.log("\n\n ====== build reporting ======= \n\n")
      result
        .run(message.buildId)
        .then(x => {callback(null, x)})
        .catch(err => {callback(err, null)})
    }
  }
}
