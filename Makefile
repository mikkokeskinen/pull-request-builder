.PHONY: ci-cd

STACK        ?= ci-cd
GITHUB_TOKEN ?=
GITHUB_REPO  ?=
CODE_BUILD_IMAGE ?= aws/codebuild/docker:1.12.1

AWS_CODE_BUILD ?= $(subst /,-,$(GITHUB_REPO))

##
## build serverless ci-cd to aws account
ci-cd:
	@aws cloudformation create-stack \
		--stack-name ${STACK} \
		--parameters \
			ParameterKey=GithubToken,ParameterValue=${GITHUB_TOKEN} \
		--template-body file://./resources/ci-cd.yml \
		--capabilities CAPABILITY_IAM \
		--capabilities CAPABILITY_NAMED_IAM && \
	aws cloudformation wait stack-create-complete \
		--stack-name ${STACK}

patch:
	@aws cloudformation update-stack \
		--stack-name ${STACK} \
		--parameters \
			ParameterKey=GithubToken,ParameterValue=${GITHUB_TOKEN} \
		--template-body file://./resources/ci-cd.yml \
		--capabilities CAPABILITY_IAM \
		--capabilities CAPABILITY_NAMED_IAM && \
	aws cloudformation wait stack-update-complete \
		--stack-name ${STACK}	

hook:
	@echo "==> hook " ;\
	K=`aws cloudformation describe-stacks --stack-name ${STACK} --query 'Stacks[0].Outputs[?OutputKey==\`AccessKeyId\`] | [0].OutputValue' --output json | xargs echo` ;\
	S=`aws cloudformation describe-stacks --stack-name ${STACK} --query 'Stacks[0].Outputs[?OutputKey==\`SecretAccessKey\`] | [0].OutputValue' --output json | xargs echo` ;\
	A=`aws cloudformation describe-stacks --stack-name ${STACK} --query 'Stacks[0].Outputs[?OutputKey==\`SNSTopic\`] | [0].OutputValue' --output json | xargs echo` ;\
	R=`aws cloudformation describe-stacks --stack-name ${STACK} --query 'Stacks[0].Outputs[?OutputKey==\`AwsRegion\`] | [0].OutputValue' --output json | xargs echo` ;\
	curl -XPOST -H "Authorization: token ${GITHUB_TOKEN}" https://api.github.com/repos/${GITHUB_REPO}/hooks -H 'Content-Type: application/json' -d "{\"name\": \"amazonsns\", \"config\": {\"aws_key\": \"$$K\", \"aws_secret\": \"$$S\", \"sns_region\": \"$$R\", \"sns_topic\": \"$$A\"}, \"events\": [\"pull_request\", \"push\"], \"active\": true}" ;\
	aws cloudformation create-stack \
		--stack-name ${AWS_CODE_BUILD} \
		--parameters \
			ParameterKey=GithubRepo,ParameterValue=https://github.com/${GITHUB_REPO} \
			ParameterKey=CodeBuildImage,ParameterValue=${CODE_BUILD_IMAGE} \
		--template-body file://./resources/github.yml \
		--capabilities CAPABILITY_IAM \
		--capabilities CAPABILITY_NAMED_IAM && \
	aws cloudformation wait stack-create-complete \
		--stack-name ${AWS_CODE_BUILD}

