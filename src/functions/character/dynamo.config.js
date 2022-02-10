const AWS = require('aws-sdk');

AWS.config.update({
  region: 'ap-northeast-2',
});

module.exports = new AWS.DynamoDB.DocumentClient();
