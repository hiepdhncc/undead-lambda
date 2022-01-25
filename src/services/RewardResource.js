const dynamo = require('../config/dynamo')
const table = require('../constants/table');
const { v4: uuid } = require('uuid');


async function getRewardResource(rewardResourceId) {
  const params = {
    TableName: table.rewardResource,
    Key: {
      'id': rewardResourceId,
    }
  };
  return await dynamo.get(params).promise().then((response) => {
    return buildResponse(200, response.item);
  }, err => {
    console.error('Err...: ', err);
  });
}

async function scanDynamoRecords(scanParams, arrayItem) {
  try {
    const data = await dynamo.scan(scanParams).promise();
    arrayItem = arrayItem.concat(data.items);
    if (data.LastEvaluateKey) {
      scanParams.ExclusiveStartKey = data.LastEvaluateKey;
      return await scanDynamoRecords(scanParams, arrayItem);
    }
    return arrayItem;
  } catch (err) {
    console.error('Err...: ', err);
  }
}

async function getRewardResources() {
  const params = {
    TableName: table.rewardResource,
  };
  const allRewardResources = await scanDynamoRecords(params, []);
  const body = {
    rewardResources: allRewardResources,
  };
  return buildResponse(200, body);
}


async function modifyRewardResource(rewardResourceId, updateKey, updateValue) {
  const params = {
    TableName: table.rewardResource,
    Key: {
      'id': rewardResourceId
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues: {
      ':value': updateValue
    },
    ReturnValues: 'UPDATED_NEW'
  };
  return await dynamo.update(params).promise().then((response) => {
    const body = {
      Operation: 'UPDATE',
      Message: 'SUCCESS',
      UpdatedAttributes: response
    };
    return buildResponse(200, body);
  }, (error) => {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
  });
}

async function deleteRewardResource(rewardResourceId) {
  const params = {
    TableName: table.rewardResource,
    Key: {
      'id': rewardResourceId
    },
    ReturnValues: 'ALL_OLD'
  };
  return await dynamo.delete(params).promise().then((response) => {
    const body = {
      Operation: 'DELETE',
      Message: 'SUCCESS',
      Item: response
    };
    return buildResponse(200, body);
  }, (error) => {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
  });
}

async function saveRewardResource(requestBody){
  const params = {
    TableName: table.rewardResource,
    Item: {
      id: uuid(),
      reward_id: requestBody.rewardId||'',
      resource_id: requestBody.resourceId||'',
      value: requestBody.value||'',
    }   
  };
  return await dynamo.put(params).promise().then(() => {
    const body = {
      Operation: 'SAVE',
      Message: 'SUCCESS',
      Item: params.Item
    };
    return buildResponse(200, body);
  }, (error) => {
    console.error('Do your custom error handling here. I am just gonna log it: ', error);
  });
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  };
}

module.exports = {saveRewardResource, deleteRewardResource, getRewardResource, getRewardResources, modifyRewardResource};