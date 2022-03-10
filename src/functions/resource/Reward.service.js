// const dynamo = require('./dynamo.config');
// const table = require('./table.constant');
// const { v4: uuid } = require('uuid');

// async function getReward(rewardId) {
//   let body = {
//     message: 'No item match!',
//   };
//   const params = {
//     TableName: table.reward,
//     Key: {
//       id: rewardId,
//     },
//   };
//   return await dynamo
//     .get(params)
//     .promise()
//     .then(
//       response => {
//         if (_.isEmpty(response)) {
//           return buildResponse(404, body);
//         }
//         body = {
//           message: 'SUCCESS',
//           item: response.Item,
//         };
//         return buildResponse(200, body);
//       },
//       err => {
//         body.message = err.message;
//         return buildResponse(400, body);
//       }
//     );
// }

// async function scanDynamoRecords(scanParams, arrayItem) {
//   try {
//     const data = await dynamo.scan(scanParams).promise();
//     arrayItem = arrayItem.concat(data.Items);
//     if (data.LastEvaluatedKey) {
//       scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
//       return await scanDynamoRecords(scanParams, arrayItem);
//     }
//     return arrayItem;
//   } catch (err) {
//     console.error('Err...: ', err);
//   }
// }

// async function getRewards() {
//   let body = {
//     message: 'SUCCESS',
//     rewards: [],
//   };
//   const params = {
//     TableName: table.reward,
//   };
//   const allRewards = await scanDynamoRecords(params, []);
//   body.rewards = allRewards;
//   return buildResponse(200, body);
// }

// async function modifyReward(rewardId, updateKey, updateValue) {
//   const params = {
//     TableName: table.reward,
//     Key: {
//       id: rewardId,
//     },
//     UpdateExpression: `set ${updateKey} = :value`,
//     ExpressionAttributeValues: {
//       ':value': updateValue,
//     },
//     ReturnValues: 'UPDATED_NEW',
//   };
//   return await dynamo
//     .update(params)
//     .promise()
//     .then(
//       response => {
//         const body = {
//           operation: 'UPDATE',
//           message: 'SUCCESS',
//           updatedAttributes: response.Attributes,
//         };
//         return buildResponse(200, body);
//       },
//       error => {
//         console.error('Do your custom error handling here. I am just gonna log it: ', error);
//       }
//     );
// }

// async function deleteReward(rewardId) {
//   const params = {
//     TableName: table.reward,
//     Key: {
//       id: rewardId,
//     },
//     ReturnValues: 'ALL_OLD',
//   };
//   return await dynamo
//     .delete(params)
//     .promise()
//     .then(
//       response => {
//         const body = {
//           operation: 'DELETE',
//           message: 'SUCCESS',
//           item: response.Attributes,
//         };
//         return buildResponse(200, body);
//       },
//       error => {
//         console.error('Do your custom error handling here. I am just gonna log it: ', error);
//       }
//     );
// }

// async function saveReward(requestBody) {
//   const params = {
//     TableName: table.reward,
//     Item: {
//       id: uuid(),
//       is_auto_claim: requestBody.isAutoClaim || false,
//       type: requestBody.type || '',
//       description: requestBody.description || '',
//     },
//   };
//   return await dynamo
//     .put(params)
//     .promise()
//     .then(
//       () => {
//         const body = {
//           operation: 'SAVE',
//           message: 'SUCCESS',
//           item: params.Item,
//         };
//         return buildResponse(200, body);
//       },
//       error => {
//         console.error('Do your custom error handling here. I am just gonna log it: ', error);
//       }
//     );
// }

// function buildResponse(statusCode, body) {
//   return {
//     statusCode,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: body,
//   };
// }

// module.exports = { saveReward, deleteReward, getReward, getRewards, modifyReward };
