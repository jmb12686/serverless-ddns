'use strict'
const constants = require('./Constants');
const responses = constants.responses;

const sms = require('sms-service');
const smsService = new sms.SMSService();

console.log('Loading echoip() function')

module.exports.handler = async (event, context) => {

    try {
        validateRequest(event);
        var response = processRequest(event);
        return response;
    } catch (err) {
        return responses.error(err);
    }

}

function validateRequest(event) {
    if (event.httpMethod !== 'GET') {
        throw new Error(`Unsupported http method: "${event.httpMethod}"`);
    }
}

async function processRequest(event) {
    var sourceIP = event['requestContext']['identity']['sourceIp'];
    console.log("Received GET request from IP ", sourceIP);
    await smsService.sendSMS(process.env.SMS_PHONE_NUMBER, `Received GET request from IP ${sourceIP}`);
    return responses.success(sourceIP);
}
