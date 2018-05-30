'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.after = exports.before = undefined;

var _codebuild = require('./codebuild');

var _github2 = require('./github');

//
//
// @doc
//   GitHub Pull Request build pipeline
var before = exports.before = async function before(json) {
  return json.ref && json.ref.startsWith('refs/heads/master') && json.head_commit ? initiate(json) : undefined;
};

//
//
var after = exports.after = async function after(json) {
  return json.source.buildspec === "buildspec.yml" ? complete(json) : undefined;
};

//
//
var initiate = async function initiate(json) {
  console.log("\n\n ====== initiate: build spec ======= \n\n");

  // Note: GitHub commit message for merged PR
  //       "Merge pull request #48 from ...\n\n..."
  var pr = json.head_commit.message.match(/#\d+/)[0].substring(1);
  var codebuild = await (0, _codebuild.buildspec)(json.repository.full_name, pr, json.after);
  console.log("==> build pending", JSON.stringify(codebuild));

  var message = '**ci/cd**: [pending](' + (0, _codebuild.buildUrl)(codebuild.build) + ')\n\n';
  var github = await (0, _github2.comment)(json.repository.full_name, pr, message);
  console.log("==> github", JSON.stringify(github));
};

//
//
var complete = async function complete(json) {
  console.log("\n\n ====== complete: build spec ======= \n\n");
  var status = (0, _codebuild.buildStatus)(json);

  if (status.success) {
    var message = '**ci/cd**: [success](' + (0, _codebuild.buildUrl)(json) + ')\n\n' + status.message;
    var github = await (0, _github2.comment)((0, _codebuild.buildRepo)(json), (0, _codebuild.buildPR)(json), message);
    console.log("==> github", JSON.stringify(github));
  } else {
    var _message = '**ci/cd**: [failure](' + (0, _codebuild.buildUrl)(json) + ')\n\n' + status.message;
    var _github = await (0, _github2.comment)((0, _codebuild.buildRepo)(json), (0, _codebuild.buildPR)(json), _message);
    console.log("==> github", JSON.stringify(_github));
  }
};