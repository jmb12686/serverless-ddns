'use strict'

class UpdateDNSScript {
    constructor(route53, notificationScript, hostName) {
        this.route53 = route53;
        this.hostName = hostName;
        this.notificationScript = notificationScript;
    }


    async update(newIP) {
        const route53HostedZoneId = await this.getRoute53HostedZoneId();
        console.log("found matching hostedZoneId: " + route53HostedZoneId + " for hostName: " + this.hostName);
        const currentIP = await this.getCurrentIP(route53HostedZoneId, this.hostName);
        console.log("currentIP for hostName: " + this.hostName + " in route53 = " + currentIP);
        if (newIP === currentIP) {
            console.log("IP has not changed for hostName: [" + this.hostName + "], exiting...");
            return "Success - No Change";
        } else {
            console.log("IP has changed for hostName: [" + this.hostName + "], issuing recordSet UPSERT");
            const updateRequest = this.getUpdateRequest(route53HostedZoneId, this.hostName, newIP);
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

    async getCurrentIP(hostedZoneID, hostName) {
        console.log("Querying route53 for record set with hostName: " + hostName);
        var params = {
            HostedZoneId: hostedZoneID,
            StartRecordName: hostName,
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


    /**
     * Gets Route53 HostedZoneId from from AWS
     */
    async getRoute53HostedZoneId() {
        let hostedZoneData;
        const givenDomainNameReverse = this.hostName.split(".").reverse();

        try {
            hostedZoneData = await this.route53.listHostedZones({}).promise();
            const targetHostedZone = hostedZoneData.HostedZones
                .filter((hostedZone) => {
                    let hostedZoneName;
                    if (hostedZone.Name.endsWith(".")) {
                        hostedZoneName = hostedZone.Name.slice(0, -1);
                    } else {
                        hostedZoneName = hostedZone.Name;
                    }
                    const hostedZoneNameReverse = hostedZoneName.split(".").reverse();

                    if (givenDomainNameReverse.length === 1
                        || (givenDomainNameReverse.length >= hostedZoneNameReverse.length)) {
                        for (let i = 0; i < hostedZoneNameReverse.length; i += 1) {
                            if (givenDomainNameReverse[i] !== hostedZoneNameReverse[i]) {
                                return false;
                            }
                        }
                        return true;
                    }
                    return false;
                })
                .sort((zone1, zone2) => zone2.Name.length - zone1.Name.length)
                .shift();

            if (targetHostedZone) {
                const hostedZoneId = targetHostedZone.Id;
                // Extracts the hostzone Id
                const startPos = hostedZoneId.indexOf("e/") + 2;
                const endPos = hostedZoneId.length;
                return hostedZoneId.substring(startPos, endPos);
            }
        } catch (err) {
            console.log(err, err.stack);
            throw new Error(`Error: Unable to list hosted zones in Route53.\n${err}`);
        }
        throw new Error(`Error: Could not find hosted zone "${this.hostName}"`);
    };

}

module.exports = UpdateDNSScript;