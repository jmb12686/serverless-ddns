


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

`ddnsHostedZoneID` - Route53 hostedZoneID of ddnsHostName referenced above

`notificationTopicARN` - TopicARN, in SNS, that you wish to receive notifications on.  Notifications are sent upon a successful DDNS update or failed attempt.


## Usage

First, create the custom domain in API Gateway and route53 (corresponds to the `apiDomainName` config variable):
```
serverless create_domain
```
Now, deploy the serverless stack:

```
serverless deploy
```


## TODO
1) Eliminate topicARN requirement, and instead send to arbitrary email and/or SMS 

2) eliminate HostedZoneID requirement and install to search in route53 based on ddnsHostName