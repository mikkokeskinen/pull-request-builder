const monad  = require('./monad')
require('./Function.prototype.$_')

const github = require('octonode')
const GitHub = require('octocat')


module.exports.update = (status, description, build, text) => {

  const repo   = build.source.location.replace('https://github.com/', '')
  const url    = `https://console.aws.amazon.com/codebuild/home?region=${process.env.AWS_REGION}#/builds/${build.id}/view/new`
  const client = github.client(process.env.GITHUB_TOKEN)
  const ghrepo = client.repo(repo)
  const ghapi  = new GitHub({token: process.env.GITHUB_TOKEN})


  return new Promise((accept, reject) => {
    console.log("\n\n ====== github status ======= \n\n")

    if (build.sourceVersion.startsWith('pr/'))
    {
      const pr   = build.sourceVersion.substring(3)
      const ghpr = client.pr(repo, pr)

      ghpr.commits(
        (err, commits, head) => {
          if (err) {
            console.log("==> unable to fetch commits", JSON.stringify({repo: repo, pr: pr, error: err}))
            reject(err)
          } else {
            console.log("==> commits", JSON.stringify(commits))
            var sha = commits[commits.length - 1].sha
            var req = {
              "state": status,
              "target_url": url,
              "description": description
            }

            ghapi
              .repo(repo)
              .createStatus(sha, req)
              .then(accept)
              .catch(reject)

            // ghrepo.status(sha, req, 
            //   (err, data, headers) => {
            //     if (err) {
            //       console.log("==> unable to update status", JSON.stringify(err))
            //       reject(err)
            //     } else {
            //       accept(data)
            //     }
            //   }
            // )
          }
        }
      )
    } else {
      ghrepo.commit(build.sourceVersion,
        (err, commit, head) => {
          if (err) {
            console.log("==> unable to fetch commits", JSON.stringify({repo: repo, version: build.sourceVersion, error: err}))
            reject(err)
          } else {
            console.log("==> commit", JSON.stringify(commit))
            var found = commit.commit.message.match(/#\d+/)
            if (found)
            {
              var pr = found[0].substring(1)
              var ghpr = client.issue(repo, pr)
              ghpr.createComment(
                {
                  'body': description + ': [' + status + '](' + url + ')\n\n' + text
                },
                (err, data, headers) => {
                  if (err) {
                    console.log("==> unable to update status", JSON.stringify(err))
                    reject(err)
                  } else {
                    accept(data)
                  }
                }
              )
            } else {
              accept(build)
            }
          }
        }
      )
    }
  })
}
