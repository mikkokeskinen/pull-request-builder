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
//   GitHub Pull Request check pipeline
var before = exports.before = async function before(json) {
  return json.pull_request && (json.action == 'opened' || json.action == 'synchronize') ? initiate(json) : undefined;
};

//
//
var after = exports.after = async function after(json) {
  return json.source.buildspec === "checkspec.yml" ? complete(json) : undefined;
};

//
//
var initiate = async function initiate(json) {
  console.log("\n\n ====== initiate: check spec ======= \n\n");

  var codebuild = await (0, _codebuild.checkspec)(json.repository.full_name, json.pull_request.number, json.pull_request.head.sha);
  console.log("==> build pending", JSON.stringify(codebuild));

  var github = await (0, _github2.pending)(json.repository.full_name, json.pull_request.head.sha, (0, _codebuild.buildUrl)(codebuild.build));
  console.log("==> github", JSON.stringify(github));
};

//
//
var complete = async function complete(json) {
  console.log("\n\n ====== complete: check spec ======= \n\n");

  var status = (0, _codebuild.buildStatus)(json);
  if (status.success) {
    var github = await (0, _github2.success)((0, _codebuild.buildRepo)(json), (0, _codebuild.buildCommit)(json), (0, _codebuild.buildUrl)(json), status.message);
    console.log("==> github", JSON.stringify(github));
  } else {
    var _github = await (0, _github2.failure)((0, _codebuild.buildRepo)(json), (0, _codebuild.buildCommit)(json), (0, _codebuild.buildUrl)(json), status.message);
    console.log("==> github", JSON.stringify(_github));
  }
};