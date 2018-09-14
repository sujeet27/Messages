// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
//AWS.config.update({region: 'us-west-2'});
AWS.config.loadFromPath('config.json');

// Create EC2 service object
var ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

// Retrieve key pair descriptions; no params needed
ec2.describeKeyPairs(function(err, data) {
   if (err) {
      console.log("Error", err);
   } else {
      console.log("Success", JSON.stringify(data.KeyPairs));
   }
});