# Serverless CI/CD

**Check**, **Build** and **Carry** your software to cloud without thinking about servers. 

This will build out all the resources needed to use 
[AWS codebuild](https://aws.amazon.com/codebuild/) and integrate
with a github to make a pull request builder.

When a commit is pushed to github.  Github sends a webhook
which then invokes the Lambda. The lambda will update github
via the status api and set the status to pending. The last step
of codebuild will invoke the lambda again to report the build result.


## Key features

The project implements lightweight CI/CD pipelines using **AWS CodeBuild**. These pipelines are
integrated with public/private repositories on **GitHub**. Pipelines specifications are
**co-allocated with code** and kept in the same repository as code, using [build specification](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html). Therefore, it always
produces repeatable builds.

This solution is optimal if your team uses [forking workflow](doc/workflow.md) to manage software repositories. However, you can still use and configure if your teams uses other workflows.

It supports a following pipelines

* **check** validity of every commit associated with pull request, the pipeline is suitable for testing, style checks, etc.
* **build** deployable artifacts from every pull request and validate them at staging/development environments, the pipeline orchestrates assembly of docker images and they deployments to non-production environments. 
* **carry** artifacts to production environment.

This repository allows you to forget about house keeping and administration of Jenkins or similar systems.


## Getting started

The latest version of serverless CI/CD is available at `master` branch. All development, including new features and bug fixes, take place on the master branch using forking and pull requests. The project do not supply any pre-build releases, you have to [setup and configure](doc/setup.md) everything by yourself. 

You can enable pipelines for your repositories once the serverless CI/CD is [configured](doc/setup.md) at you AWS Account. The pipelines are executed by CodeBuild and triggered by GitHub using webhooks. The project provides a helper script that automates integration with CI/CD per GitHub repository.

Run the following command, to create all necessary elements 
```bash
make hook GITHUB_REPO=:org/:repo CODE_BUILD_TK=:docker/:image TIMEOUT=:sec
```

Finally, you need to setup `checkspec.yml`, `buildspec.yml` and `carryspec.yml` in your project, they defines a sequence of actions taken by CodeBuild pipelines. See [CodeBuild manual](http://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html)

Notice that you'll need to trigger a webhook call in the post_build step.

```YAML
version: 0.1

phases:
  install:
    commands:
      - echo "==> install"
  pre_build:
    commands:
      - echo "==> pre-build"
  build:
    commands:
      - echo "==> testing"
  post_build:
    commands:
       - 'curl -XPOST https://your-api-id.execute-api.eu-west-1.amazonaws.com/webhook -d "{\"build\": \"$CODEBUILD_BUILD_ID\"}"'
```
