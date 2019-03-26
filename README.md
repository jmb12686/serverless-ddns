


## Installation

```
$ git clone https://github.com/jmb12686/serverless-ddns

$ cd serverless-ddns

$ npm init
```
## Configuration

Modify the following configuration parameters in config.json:

`apiDomainName` - URL to host on API Gateway.  Must have matching AWS Certificate Manager and own domain in Route53

`ddnsHostName` - Domain name, owned in Route 53, that you want to keep updated with a dynamic IP.

`notificationTopicARN` - TopicARN, in SNS, that you wish to receive notifications on.  Notifications are sent upon a successful DDNS update or failed attempt.


## Deployment

First, create the custom domain in API Gateway and route53 (corresponds to the `apiDomainName` config variable):
```
serverless create_domain
```
Now, deploy the serverless stack:

```
serverless deploy
```

## Usage
Usage instructions for interacting with the ddns API

#### Fetch caller IP
Fetch current caller IP, similar to 'what's my ip':

`$ curl https://apiDomainName`

#### Update DNS with new IP
POST 'homeIp' JSON to API endpoint with AWS IAM Signature.  User api user is created upon stack deployment.  Use [aws-authenticated-curl-utility](https://github.com/jmb12686/aws-authenticated-curl-utility) to properly sign authenticated requests

`$ post_it.sh -credentials <aws_access_key>:<aws_secret_key> -url <api_url> -region us-east-1 -service execute-api -body "'{\"homeIp\":\"$ip\"}'"`

## TODO
1) Eliminate topicARN requirement, and instead send to arbitrary email and/or SMS 
