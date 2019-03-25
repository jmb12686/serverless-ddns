'use strict';

console.log('Loading updateHomeDNS() function')

var AWS = require('aws-sdk');
const route53 = new AWS.Route53();
const sns = new AWS.SNS();

const constants = require('./Constants');
const responses = constants.responses;

const NotificationScript = require('./scripts/notificationScript');
const notificationScript = new NotificationScript(sns, process.env.TOPIC_ARN);

const UpdateDNSScript = require('./scripts/updateDNSScript');
const updateDNSScript = new UpdateDNSScript(route53, notificationScript, process.env.HOSTED_ZONE_ID, process.env.DNS_HOST_NAME);
// const updateDNSScript = require('./scripts/updateDNSScript')(route53, notificationScript, process.env.HOSTED_ZONE_ID, process.env.DNS_HOST_NAME);



module.exports.handler = async (event) => {

  try {
    validateRequest(event);
    var response = await processRequest(event);
    return response;
  } catch (err) {
    return responses.error(err);
  }

}

function validateRequest(event) {
  if (event.httpMethod !== 'POST') {
    throw new Error(`Unsupported http method: "${event.httpMethod}"`);
  }
}

async function processRequest(event) {
  var requestBody = JSON.parse(event.body);
  var homeIp = requestBody['homeIp'];
  var responseMsg = await updateDNSScript.update(homeIp);
  return responses.success(responseMsg);


}




  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     message: 'Go Serverless v1.0! Your function executed successfully!',
  //     input: event,
  //   }),
  // };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };
