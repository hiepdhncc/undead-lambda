var AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-southeast-1'
});


var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var credentials = new AWS.SharedIniFileCredentials({profile: 'default'});
AWS.config.credentials = credentials;

var params = {};

sqs.listQueues(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.QueueUrls);
  }
});