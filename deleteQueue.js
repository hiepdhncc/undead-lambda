var AWS = require('aws-sdk');
AWS.config.update({region: 'ap-southeast-1'});

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var params = {
  QueueUrl: 'https://sqs.us-east-2.amazonaws.com/828159465590/TEST_QUEUE'
 };

sqs.deleteQueue(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data);
  }
});