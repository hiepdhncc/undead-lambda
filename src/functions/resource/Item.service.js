// const dynamo = require('./dynamo.config');
// const table = require('./table.constant');
// const { v4: uuid } = require('uuid');
// const _ = require('lodash');

// async function getItem(itemId) {
//   let body = {
//     message: 'No item match!',
//   };
//   const params = {
//     TableName: table.item,
//     Key: {
//       id: itemId,
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

// async function getItems() {
//   let body = {
//     message: 'SUCCESS',
//     itemTypes: [],
//   };
//   const params = {
//     TableName: table.item,
//   };
//   const allItems = await scanDynamoRecords(params, []);
//   body.items = allItems;
//   return buildResponse(200, body);
// }

// async function modifyItem(itemId, updateKey, updateValue) {
//   let body = {
//     message: 'FAILED',
//   };
//   const item = await dynamo.get({
//     TableName: table.item,
//     Key : {id : itemId}
//   }).promise();
//   if(_.isEmpty(item))
//     return buildResponse(400, body);
//   const params = {
//     TableName: table.item,
//     Key: {
//       id: itemId,
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
//         if (!response.Attributes) {
//           body = {
//             message: 'Cannot modify item that does not exist!',
//           };
//           return buildResponse(404, body);
//         }
//         body = {
//           message: 'SUCCESS!',
//           updatedAttributes: response.Attributes,
//         };
//         return buildResponse(200, body);
//       },
//       error => {
//         body.message = error.message;
//         return buildResponse(400, body);
//       }
//     );
// }

// async function deleteItem(itemId) {
//   let body = {
//     message: 'FAILED',
//   };
//   const params = {
//     TableName: table.item,
//     Key: {
//       id: itemId,
//     },
//     ReturnValues: 'ALL_OLD',
//   };
//   return await dynamo
//     .delete(params)
//     .promise()
//     .then(
//       response => {
//         if (!response.Attributes) {
//           body = {
//             message: 'Cannot delete item that does not exist',
//           };
//           return buildResponse(404, body);
//         }
//         body = {
//           message: 'SUCCESS',
//           item: response.Attributes,
//         };
//         return buildResponse(200, body);
//       },
//       error => {
//         body.message = error.message;
//         return buildResponse(400, body);
//       }
//     );
// }

// async function saveItem(requestBody) {
//   let body = {
//     message: 'Failed',
//   };
//   const type = await dynamo.get({
//     TableName: table.itemType,
//     Key: {
//       id: requestBody.itemTypeId
//     }
//   }).promise();
//   if(_.isEmpty(type))
//     return buildResponse(400, body);
//   const params = {
//     TableName: table.item,
//     Item: {
//       id: uuid(),
//       item_type_id: requestBody.itemTypeId || '',
//       description: requestBody.description || '',
//     },
//   };
//   return await dynamo
//     .put(params)
//     .promise()
//     .then(
//       () => {
//         body = {
//           message: 'SUCCESS',
//           item: params.Item,
//         };
//         return buildResponse(200, body);
//       },
//       error => {
//         body.message = error.message;
//         return buildResponse(400, body);
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

// module.exports = { saveItem, deleteItem, getItem, getItems, modifyItem };
