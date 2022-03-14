const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-2' });
const sqs = new AWS.SQS();
const pg = require('pg');

let sqsURL;

exports.handler = async function (event, context) {
  switch (event.queue) {
    case 'resource':
      sqsURL = 'https://sqs.ap-northeast-2.amazonaws.com/427839003081/ResourceQueue.fifo';
      break;

    case 'character':
      sqsURL = 'https://sqs.ap-northeast-2.amazonaws.com/427839003081/CharacterQueue.fifo';
      break;

    case 'weapon':
      sqsURL = 'https://sqs.ap-northeast-2.amazonaws.com/427839003081/WeaponQueue.fifo';
      break;

    default:
    // code
  }
  const params = {
    MessageBody: JSON.stringify(event),
    QueueUrl: sqsURL,
    MessageDeduplicationId: `${Math.random()}-${Math.random()}`,
    MessageGroupId: `${Math.random()}-${Math.random()}`,
  };
  await sqs
    .sendMessage(params)
    .promise()
    .then(
      response => {
        console.log(JSON.stringify(response));
      },
      err => {
        console.error(err);
      }
    );

  return { message: 'success!!' };
};
