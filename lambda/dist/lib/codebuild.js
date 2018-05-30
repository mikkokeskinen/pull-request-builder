"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.carryspec = exports.buildspec = exports.checkspec = exports.fetchBuild = exports.buildPR = exports.buildCommit = exports.buildRepo = exports.buildStatus = exports.buildUrl = undefined;

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.update({ region: process.env.AWS_REGION }); // @doc
//   AWS CodeBuild helpers

var codebuild = new _awsSdk2.default.CodeBuild();

//
//
var buildUrl = exports.buildUrl = function buildUrl(build) {
  return "https://console.aws.amazon.com/codebuild/home?region=" + process.env.AWS_REGION + "#/builds/" + build.id + "/view/new";
};

//
//
var buildStatus = exports.buildStatus = function buildStatus(build) {
  var fails = build.phases.filter(function (x) {
    return x.phaseStatus && x.phaseStatus !== "SUCCEEDED";
  });
  var phases = build.phases.filter(function (x) {
    return x.phaseType === "BUILD";
  });

  if (fails.length > 0) {
    var message = "build failed " + fails[0].contexts[0].statusCode + ": " + fails[0].contexts[0].message;
    return { success: false, message: message };
  } else if (phases.length > 0) {
    var _message = "build duration " + phases[0].durationInSeconds + " seconds";
    return { success: true, message: _message };
  } else {
    var _message2 = 'build failed';
    return { success: false, message: _message2 };
  }
};

//
//
var buildRepo = exports.buildRepo = function buildRepo(build) {
  return build.source.location.replace('https://github.com/', '');
};

//
//
var buildCommit = exports.buildCommit = function buildCommit(build) {
  return build.environment.environmentVariables.filter(function (x) {
    return x.name === 'GIT_COMMIT';
  })[0].value;
};

//
//
var buildPR = exports.buildPR = function buildPR(build) {
  return build.environment.environmentVariables.filter(function (x) {
    return x.name === 'GIT_PR';
  })[0].value;
};

//
//
var fetchBuild = exports.fetchBuild = async function fetchBuild(id) {
  return codebuild.batchGetBuilds({ ids: [id] }).promise().then(function (x) {
    return x.builds[0];
  });
};

//
//
var checkspec = exports.checkspec = async function checkspec(repo, pr, commit) {
  return codebuild.startBuild({
    projectName: repo.replace('/', '-'),
    artifactsOverride: { type: 'NO_ARTIFACTS' },
    sourceVersion: "pr/" + pr,
    environmentVariablesOverride: [{ name: 'GIT_PR', value: "" + pr }, { name: 'GIT_COMMIT', value: commit }],
    buildspecOverride: 'checkspec.yml'
  }).promise();
};

//
//
var buildspec = exports.buildspec = async function buildspec(repo, pr, commit) {
  return codebuild.startBuild({
    projectName: repo.replace('/', '-'),
    artifactsOverride: { type: 'NO_ARTIFACTS' },
    sourceVersion: commit,
    environmentVariablesOverride: [{ name: 'GIT_PR', value: "" + pr }, { name: 'GIT_COMMIT', value: commit }],
    buildspecOverride: 'buildspec.yml'
  }).promise();
};

//
//
var carryspec = exports.carryspec = async function carryspec(repo, pr, commit) {
  return codebuild.startBuild({
    projectName: repo.replace('/', '-'),
    artifactsOverride: { type: 'NO_ARTIFACTS' },
    sourceVersion: commit,
    environmentVariablesOverride: [{ name: 'GIT_PR', value: "" + pr }, { name: 'GIT_COMMIT', value: commit }],
    buildspecOverride: 'carryspec.yml'
  }).promise();
};