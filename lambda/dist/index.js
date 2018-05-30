'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = undefined;

var _codebuild = require('./lib/codebuild');

var _checkspec = require('./lib/checkspec');

var checkspec = _interopRequireWildcard(_checkspec);

var _buildspec = require('./lib/buildspec');

var buildspec = _interopRequireWildcard(_buildspec);

var _carryspec = require('./lib/carryspec');

var carryspec = _interopRequireWildcard(_carryspec);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

//
//
// @doc
//   Serverless CI/CD with AWS Code Build
//
//   see 
//   * https://developer.github.com/webhooks/
var handler = exports.handler = async function handler(json) {
  console.log("\n\n ====== ci/cd action ======= \n\n");
  console.log("\n\n", JSON.stringify(json), "\n\n");

  try {
    if (typeof json.build !== 'undefined') {
      var build = await (0, _codebuild.fetchBuild)(json.build);
      console.log("==> build completed", JSON.stringify(build));
      await checkspec.after(build);
      await buildspec.after(build);
      await carryspec.after(build);
    } else {
      await checkspec.before(json);
      await buildspec.before(json);
      await carryspec.before(json);
    }
  } catch (e) {
    console.error("== ci/cd failed ==>", e);
  }
};