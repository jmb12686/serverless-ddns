'use strict'

class UpdateDNSScript {
    constructor(route53, notificationScript, hostedZoneID, hostName) {
        this.route53 = route53;
        this.hostedZoneID = hostedZoneID;
        this.hostName = hostName;
        this.notificationScript = notificationScript;
    }


    async update(newIP) {
        const currentIP = await this.getCurrentIP();
        console.log("currentIP in route53 = " + currentIP);
        if (newIP === currentIP) {
            console.log("IP has not changed for hostName: [" + this.hostName + "], exiting...");
            return "Success - No Change";
        } else {
            console.log("IP has changed for hostName: [" + this.hostName + "], issuing recordSet UPSERT");
            const updateRequest = this.getUpdateRequest(this.hostedZoneID, this.hostName, newIP);
            try {
                const result = await this.route53.changeResourceRecordSets(updateRequest).promise();
                console.log("Successfully changed [" + this.hostName + "] IP to " + newIP + ".  Result from route53 changeResourceRecordSets:" + JSON.stringify(result, null, 2));
                await this.notificationScript.sendMessage("UpdateHomeDNS Lambda Function", "Success - Changed [" + this.hostName + "] IP to " + newIP);
                return "Success - Changed [" + this.hostName + "] IP to " + newIP;
            } catch (err) {
                console.log(err, err.stack);
                await this.notificationScript.sendMessage("UpdateHomeDNS Lambda Function", "Failed - See Logs");
                throw new Error("Failed - See Logs")
            }

        }
    }

    async getCurrentIP() {
        console.log("QUerying route53 for record set with hostName: " + this.hostName);
        var params = {
            HostedZoneId: this.hostedZoneID,
            StartRecordName: this.hostName,
            MaxItems: '1'
        };
        var data = await this.route53.listResourceRecordSets(params).promise();
        return data.ResourceRecordSets[0].ResourceRecords[0].Value;
    }

    getUpdateRequest(zoneID, dnsName, newIP) {
        return {
            "HostedZoneId": '/hostedzone/' + zoneID,
            "ChangeBatch": {
                "Changes": [
                    {
                        "Action": "UPSERT",
                        "ResourceRecordSet": {
                            "Name": dnsName,
                            "Type": "A",
                            "TTL": 3600,
                            "ResourceRecords": [
                                {
                                    "Value": newIP
                                }
                            ]
                        }
                    }
                ]
            }
        };
    }
}

module.exports = UpdateDNSScript;