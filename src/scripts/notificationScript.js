'use strict';

class NotificationScript {
    constructor(sns, topicARN) {
        this.sns = sns;
        this.topicARN = topicARN;
    }

    async sendMessage(subject, message) {
        const params = {
            TopicArn: this.topicARN,
            Subject: subject,
            Message: message
        };

        return await this.sns.publish(params).promise();
    }
}

module.exports = NotificationScript;