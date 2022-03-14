const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const { v4: uuid } = require('uuid');
const _ = require('lodash');

async function getUserResource(userResourceId) {
  let body = {
    message: 'No item match!',
  };
  const params = {
    TableName: table.userResource,
    Key: {
      id: userResourceId,
    },
  };
  return await dynamo
    .get(params)
    .promise()
    .then(
      response => {
        if (_.isEmpty(response)) {
          return buildResponse(404, body);
        }
        body = {
          message: 'SUCCESS',
          item: response.Item,
        };
        return buildResponse(200, body);
      },
      err => {
        body.message = err.message;
        return buildResponse(400, body);
      }
    );
}

async function scanDynamoRecords(scanParams, arrayItem) {
  try {
    const data = await dynamo.scan(scanParams).promise();
    arrayItem = arrayItem.concat(data.Items);
    if (data.LastEvaluateKey) {
      scanParams.ExclusiveStartKey = data.LastEvaluateKey;
      return await scanDynamoRecords(scanParams, arrayItem);
    }
    return arrayItem;
  } catch (err) {
    console.error('Err...: ', err);
  }
}

async function getUserResources() {
  let body = {
    message: 'SUCCESS',
    userResources: [],
  };
  const params = {
    TableName: table.userResource,
  };
  const allUserResources = await scanDynamoRecords(params, []);
  body.userResources = allUserResources;
  return buildResponse(200, body);
}

async function modifyUserResource(userResourceId, updateKey, updateValue) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.userResource,
    Key: {
      id: userResourceId,
    },
    UpdateExpression: `set ${updateKey} = :v`,
    ExpressionAttributeValues: {
      ':v': updateValue,
    },
    ReturnValues: 'UPDATED_NEW',
  };
  return await dynamo
    .update(params)
    .promise()
    .then(
      response => {
        if (!response.Attributes) {
          body = {
            message: 'Cannot modify item that does not exist!',
          };
          return buildResponse(404, body);
        }
        body = {
          message: 'SUCCESS!',
          updatedAttributes: response.Attributes,
        };
        return buildResponse(200, body);
      },
      error => {
        body.message = error.message;
        return buildResponse(400, body);
      }
    );
}

async function deleteUserResource(userResourceId) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.userResource,
    Key: {
      id: userResourceId,
    },
    ReturnValues: 'ALL_OLD',
  };
  return await dynamo
    .delete(params)
    .promise()
    .then(
      response => {
        if (!response.Attributes) {
          body = {
            message: 'Cannot delete item that does not exist',
          };
          return buildResponse(404, body);
        }
        body = {
          message: 'SUCCESS',
          item: response.Attributes,
        };
        return buildResponse(200, body);
      },
      error => {
        body.message = error.message;
        return buildResponse(400, body);
      }
    );
}

async function saveUserResource(requestBody) {
  let body = {
    message: 'Failed',
  };
  const params = {
    TableName: table.userResource,
    Item: {
      id: uuid(),
      resource_id: requestBody.resourceId || '',
      user_id: requestBody.userId || '',
      amount: requestBody.amount || 0,
    },
  };
  return await dynamo
    .put(params)
    .promise()
    .then(
      () => {
        body = {
          message: 'SUCCESS',
          item: params.Item,
        };
        return buildResponse(200, body);
      },
      error => {
        body.message = error.message;
        return buildResponse(400, body);
      }
    );
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body,
  };
}

async function claimResource(userId, resourceId, amount) {
  const params = {
    TableName: table.userResource,
    FilterExpression: 'user_id = :userId and resource_id = :resourceId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':resourceId': resourceId,
    },
  };

  const userResources = await scanDynamoRecords(params, []);
  if (userResources && userResources.length > 0) {
    return await modifyUserResource(
      userResources[0].id,
      'amount',
      amount + userResources[0].amount
    );
  } else {
    const userResource = {
      userId,
      resourceId,
      amount: amount,
    };
    return await saveUserResource(userResource);
  }
}

module.exports = {
  saveUserResource,
  deleteUserResource,
  getUserResource,
  getUserResources,
  modifyUserResource,
  claimResource,
};
