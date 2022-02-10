const dynamo = require('../config/dynamo')
const table = require('../constants/table');
const { v4: uuid } = require('uuid');

async function getCharacterType(characterTypeId) {
  const params = {
    TableName: table.characterType,
    Key: {
      'id': characterTypeId,
    }
  };
  return await dynamo.get(params).promise().then((response) => {
    const body = {
      message: 'SUCCESS',
      item: response,
    };
    return buildResponse(200, body);
  }, err => {
    console.error('Err...: ', err);
  });
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

async function getCharacterTypes() {
  const params = {
    TableName: table.characterType,
  };
  const allCharacterTypes = await scanDynamoRecords(params, []);
  const body = {
    message :"SUCCESS",
    characterTypes: allCharacterTypes,
  };
  return buildResponse(200, body);
}


async function modifyCharacterType(characterTypeId, updateKey, updateValue) {
// async function modifyCharacterType(characterTypeId, updateKey, updateValue) {
  const params = {
    TableName: table.characterType,
    Key: {
      id: characterTypeId,
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues: {
      ':value': updateValue,
    },
    // UpdateExpression: `set ${requestBody.name} = :n ,${requestBody.code} = :c ,${requestBody.description} = :d ,`,
    // ExpressionAttributeValues: {
    //   ':n': { S: requestBody.name },
    //   ':c': { S: requestBody.code },
    //   ':d': { S: requestBody.description },
    // },
    ReturnValues: 'UPDATED_NEW',
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

async function deleteCharacterType(characterTypeId) {
  const params = {
    TableName: table.characterType,
    Key: {
      'id': characterTypeId
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

async function saveCharacterType(requestBody){
  const params = {
    TableName: table.characterType,
    Item: {
      id: uuid(),
      name: requestBody.name||'',
      code: requestBody.code||'',
      description: requestBody.description||'',
    }
  };
  console.log(params.Item);
  return await dynamo.put(params).promise().then(() => {
    const body = {
      operation: 'SAVE',
      message: 'SUCCESS',
      item: params.Item
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
    message : body.message,
    data: body,
  };
}

module.exports = {saveCharacterType, deleteCharacterType, getCharacterType, getCharacterTypes, modifyCharacterType};