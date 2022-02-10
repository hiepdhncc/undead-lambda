const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const { v4: uuid } = require('uuid');

async function getUserCharacter(userCharacterId) {
  const params = {
    TableName: table.userCharacter,
    Key: {
      id: userCharacterId,
    },
  };
  return await dynamo
    .get(params)
    .promise()
    .then(
      response => {
        return buildResponse(200, response.Item);
      },
      err => {
        console.error('Err...: ', err);
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

async function getUserCharacters() {
  const params = {
    TableName: table.userCharacter,
  };
  const allUserCharacters = await scanDynamoRecords(params, []);
  const body = {
    userCharacters: allUserCharacters,
  };
  return buildResponse(200, body);
}

async function modifyUserCharacter(userCharacterId, updateKey, updateValue) {
  const params = {
    TableName: table.userCharacter,
    Key: {
      id: userCharacterId,
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
        const body = {
          operation: 'UPDATE',
          message: 'SUCCESS',
          updatedAttributes: response,
        };
        return buildResponse(200, body);
      },
      error => {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
      }
    );
}

async function deleteUserCharacter(userCharacterId) {
  const params = {
    TableName: table.userCharacter,
    Key: {
      id: userCharacterId,
    },
    ReturnValues: 'ALL_OLD',
  };
  return await dynamo
    .delete(params)
    .promise()
    .then(
      response => {
        const body = {
          operation: 'DELETE',
          message: 'SUCCESS',
          item: response,
        };
        return buildResponse(200, body);
      },
      error => {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
      }
    );
}

async function saveUserCharacter(requestBody) {
  const params = {
    TableName: table.userUserCharacter,
    Item: {
      id: uuid(),
      user_id: requestBody.userId || '',
      character_id: requestBody.characterId || '',
    },
  };
  return await dynamo
    .put(params)
    .promise()
    .then(
      () => {
        const body = {
          operation: 'SAVE',
          message: 'SUCCESS',
          item: params.Item,
        };
        return buildResponse(200, body);
      },
      error => {
        console.error('Do your custom error handling here. I am just gonna log it: ', error);
      }
    );
}

function buildResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

module.exports = {
  saveUserCharacter,
  deleteUserCharacter,
  getUserCharacter,
  getUserCharacters,
  modifyUserCharacter,
};
