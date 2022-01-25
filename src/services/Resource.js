const dynamo = require('../config/dynamo')
const table = require('../constants/table');
const { v4: uuid } = require('uuid');


async function getResource(resourceId) {
  const params = {
    TableName: table.resource,
    Key: {
      'id': resourceId,
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

async function getResources() {
  const params = {
    TableName: table.resource,
  };
  const allResources = await scanDynamoRecords(params, []);
  const body = {
    resources: allResources,
  };
  return buildResponse(200, body);
}


async function modifyResource(resourceId, updateKey, updateValue) {
  const params = {
    TableName: table.resource,
    Key: {
      'id': resourceId
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

async function deleteItem(resourceId) {
  const params = {
    TableName: table.resource,
    Key: {
      'id': resourceId
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

async function saveResource(requestBody){
  const params = {
    TableName: table.resource,
    Item: {
      id: uuid(),
      code: requestBody.code||'',
      name: requestBody.name||'',
      type: requestBody.type||'',
      description: requestBody.description||'',
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

module.exports = {saveResource, deleteResource, getResource, getResources, modifyResource};