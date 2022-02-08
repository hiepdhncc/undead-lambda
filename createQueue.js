const AWS = require('aws-sdk');

AWS.config.update({region: 'ap-southeast-1'});
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var params = {
  QueueName: 'TEST_QUEUE',
  Attributes: {
    'DelaySeconds': '60',
    'MessageRetentionPeriod': '86400'
  }
};

sqs.createQueue(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.QueueUrl);
  }
});