// @doc
//   Serverless CI/CD with AWS Code Build
//
//   see 
//   * https://developer.github.com/webhooks/
import { fetchBuild } from './lib/codebuild'

import * as checkspec from './lib/checkspec'
import * as buildspec from './lib/buildspec'
import * as carryspec from './lib/carryspec'

//
//
export const handler = async json => {
  if (!json.deleted) {
    console.log("\n\n ====== ci/cd action ======= \n\n")
    console.log("\n\n", JSON.stringify(json), "\n\n")

    try {
      if (typeof json.build !== 'undefined') {
        const build = await fetchBuild(json.build)
        console.log("==> build completed", JSON.stringify(build))
        await checkspec.after(build)
        await buildspec.after(build)
        await carryspec.after(build)
      } else {
        await checkspec.before(json)
        await buildspec.before(json)
        await carryspec.before(json)
      }
    } catch (e) {
      console.error("== ci/cd failed ==>", e)
    }
  } else {
    console.log("\n\n ====== ci/cd event tag deleted -> skipping ======= \n\n")
  }
}

