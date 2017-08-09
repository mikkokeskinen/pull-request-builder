const github = require('octonode')


module.exports.update = (status, description, build) => {

  const repo   = build.source.location.replace('https://github.com/', '')
  const url    = `https://console.aws.amazon.com/codebuild/home?region=${process.env.AWS_REGION}#/builds/${build.id}/view/new`
  const client = github.client(process.env.GITHUB_TOKEN)
  const ghrepo = client.repo(repo)
  
  return new Promise((accept, reject) => {
    console.log("\n\n ====== github status ======= \n\n")

    if (build.sourceVersion.startsWith('pr/'))
    {
      const pr   = build.sourceVersion.substring(3)
      const ghpr = client.pr(repo, pr)

      ghpr.commits(
        (err, commits, head) => {
          if (err) {
            console.log("==> unable to fetch commits", err)
            reject(err)
          } else {
            console.log("==> commits", JSON.stringify(commits))
            ghrepo.status(commits[commits.length - 1].sha, 
              {
                "state": status,
                "target_url": url,
                "description": description
              }, 
              (err, data, headers) => {
                if (err) {
                  console.log("==> unable to update status", err)
                  reject(err)
                } else {
                  accept(data)
                }
              }
            )
          }
        }
      )
    } else {
      ghrepo.commit(build.sourceVersion,
        (err, commit, head) => {
          if (err) {
            console.log("==> unable to fetch commits", err)
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
                  'body': '[' + status + '](' + url + '): ' + description
                },
                (err, data, headers) => {
                  if (err) {
                    console.log("==> unable to update status", err)
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
