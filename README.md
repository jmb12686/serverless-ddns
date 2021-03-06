
# serverless-ddns

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)

## Prerequisites

Make sure you have the following installed before starting:

* [nodejs](https://nodejs.org/en/download/)
* [npm](https://www.npmjs.com/get-npm?utm_source=house&utm_medium=homepage&utm_campaign=free%20orgs&utm_term=Install%20npm)
* [serverless](https://serverless.com/framework/docs/providers/aws/guide/installation/)

## Installation

```bash
git clone https://github.com/jmb12686/serverless-ddns
cd serverless-ddns
npm install
```

## Configuration

Modify the following configuration parameters in config.json:

`apiDomainName` - URL to host on API Gateway.  Must have matching AWS Certificate Manager and own domain in Route53

`ddnsHostName` - Domain name, owned in Route 53, that you want to keep updated with a dynamic IP.

`notificationTopicARN` - TopicARN, in SNS, that you wish to receive notifications on.  Notifications are sent upon a successful DDNS update or failed attempt.

## Deployment

First, create the custom domain in API Gateway and route53 (corresponds to the `apiDomainName` config variable):

```bash
serverless create_domain
```

Now, deploy the serverless stack:

```bash
serverless deploy
```

NOTE: Use `--stage prod` to deploy to prod

## Usage

Usage instructions for interacting with the ddns API

### Fetch caller IP

Fetch current caller IP, similar to 'what's my ip':

`$ curl https://apiDomainName`

### Update DNS with new IP

POST 'homeIp' JSON to API endpoint with AWS IAM Signature.  User api user is created upon stack deployment.  Use [aws-authenticated-curl-utility](https://github.com/jmb12686/aws-authenticated-curl-utility) to properly sign authenticated requests

`$ post_it.sh -credentials <aws_access_key>:<aws_secret_key> -url <api_url> -region us-east-1 -service execute-api -body "'{\"homeIp\":\"$ip\"}'"`

## TODO

1) Eliminate topicARN requirement, and instead send to arbitrary email and/or SMS
