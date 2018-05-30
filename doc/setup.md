# Setup Serverless CI/CD

Configuration process requires
* [AWS Account](https://aws.amazon.com)
* [aws command line](https://aws.amazon.com/cli/) interface
* [nodejs](https://nodejs.org/en/) and package manager for JavaScripts [npm](https://www.npmjs.com) 
* [make](https://www.gnu.org/software/make/) utility


**Clone** repository

```bash
git clone https://github.com/SilvereGit/pull-request-builder
cd pull-request-builder
```

**Package** a lambda function to zip archive. This function is primary handler for webhook events from GitHub and AWS CodeBuild

```bash
make lambda
```
As a result, you should get an archive at `lambda/dist/package.zip`


**Upload** the archive to S3 bucket in your AWS account. It is required by AWS CloudFormation for Lambda deployment. You can either create a new bucket or use any bucket in you account. Note `ci-cd` prefix in the S3 key is mandatory.

```bash
aws s3 cp lambda/dist/package.zip s3://serverless/ci-cd/package.zip
```

**Allocate** GitHub API token. The token is required by lambda function to publish a build status back to GitHub repository. You can allocate at GitHub > Settings > Developer settings > Personal access tokens.


**Deploy** serverless components to you AWS Account, you need to provide allocated token and reference to S3 bucket where lambda package is stored

```bash
make ci-cd GITHUB_TOKEN=:token ARTIFACT=:bucket
```

Make script use AWS CloudFormation to orchestrate deployment of all required resources at you account.
Use API Gateway endpoint (`cd-cd-webhoo-api`) to integrate your projects with CI/CD.

