'use strict';


const result = require('./lib/result')
const build = require('./lib/build')

//
// Builder Supports
//  - Pull Request (checkspec.yml)
//  - Head / Merge (buildspec.yml)  

const is_pull_request = (json) => (
  (json.pull_request && (json.action == 'opened' || json.action == 'synchronize'))
)

const is_head = (json) => (
  (json.ref && json.after)
)

const is_code_build = (json) => (
  (typeof json.buildId !== 'undefined')
)

exports.handler = (event, context, callback) => {

  const message = JSON.parse(event.Records[0].Sns.Message)

  console.log("\n\n ====== ci/cd action ======= \n\n")
  console.log("\n\n", JSON.stringify(message), "\n\n");

  if (message) 
  {
    if (is_pull_request(message)) {
      console.log("\n\n ====== pull request builder ======= \n\n")
      build
        .pull_request(message.repository.full_name, 'pr/' + message.pull_request.number)
        .then(x => {callback(null, x)})
        .catch(err => {callback(err, null)})

    } else if (is_head(message)) {
      console.log("\n\n ====== code pipeline builder ======= \n\n")
      build
        .commit(message.repository.full_name, message.after)
        .then(x => {callback(null, x)})
        .catch(err => {callback(err, null)})

    } else if (is_code_build(message)) {
      console.log("\n\n ====== build reporting ======= \n\n")
      const comment = typeof message.comment !== 'undefined' ? message.comment : ''
      result
        .run(message.buildId, comment)
        .then(x => {callback(null, x)})
        .catch(err => {callback(err, null)})
    } else {
      console.log("\n\n ====== unknown action ======= \n\n")
    }
  }
}
