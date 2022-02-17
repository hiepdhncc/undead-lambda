const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const { v4: uuid } = require('uuid');

async function getRewardResource(rewardResourceId) {
  let body = {
    message: 'No item match!',
  };
  const params = {
    TableName: table.rewardResource,
    Key: {
      id: rewardResourceId,
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
    if (data.LastEvaluatedKey) {
      scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, arrayItem);
    }
    return arrayItem;
  } catch (err) {
    console.error('Err...: ', err);
  }
}

async function getRewardResources() {
  let body = {
    message: 'SUCCESS',
    rewardResources: [],
  };
  const params = {
    TableName: table.rewardResource,
  };
  const allRewardResources = await scanDynamoRecords(params, []);
  body.rewardResources = allRewardResources;
  return buildResponse(200, body);
}

async function modifyRewardResource(rewardResourceId, updateKey, updateValue) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.rewardResource,
    Key: {
      id: rewardResourceId,
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues: {
      ':value': updateValue,
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

async function deleteRewardResource(rewardResourceId) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.rewardResource,
    Key: {
      id: rewardResourceId,
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

async function saveRewardResource(requestBody) {
  let body = {
    message: 'SUCCESS',
  };
  const params = {
    TableName: table.rewardResource,
    Item: {
      id: uuid(),
      reward_id: requestBody.rewardId || '',
      resource_id: requestBody.resourceId || '',
      value: requestBody.value || '',
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

module.exports = {
  saveRewardResource,
  deleteRewardResource,
  getRewardResource,
  getRewardResources,
  modifyRewardResource,
};
