'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.closeIssue = exports.raiseIssue = exports.comment = exports.failure = exports.success = exports.pending = undefined;

var _octocat = require('octocat');

var _octocat2 = _interopRequireDefault(_octocat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var github = new _octocat2.default({ token: process.env.GITHUB_TOKEN });

//
//
// @doc
//   GitHub API helpers
var pending = exports.pending = function pending(repo, commit, url) {
  return github.repo(repo).createStatus(commit, {
    state: 'pending',
    target_url: url,
    description: '**ci/cd**'
  });
};

//
//
var success = exports.success = function success(repo, commit, url, message) {
  return github.repo(repo).createStatus(commit, {
    state: 'success',
    target_url: url,
    description: message
  });
};

//
//
var failure = exports.failure = function failure(repo, commit, url, message) {
  return github.repo(repo).createStatus(commit, {
    state: 'failure',
    target_url: url,
    description: message
  });
};

//
//
var comment = exports.comment = function comment(repo, issue, message) {
  return github.post('/repos/' + repo + '/issues/' + issue + '/comments', { body: message });
};

//
//
var raiseIssue = exports.raiseIssue = function raiseIssue(repo, title) {
  return github.post('/repos/' + repo + '/issues', { title: title });
};

//
//
var closeIssue = exports.closeIssue = function closeIssue(repo, issue) {
  return github.patch('/repos/' + repo + '/issues/' + issue, { state: 'closed' });
};