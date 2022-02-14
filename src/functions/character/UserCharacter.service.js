const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const { v4: uuid } = require('uuid');
const _ = require('lodash');

async function getUserCharacter(userCharacterId) {
  let body = {
    message: 'No item match!',
  };
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
        if (_.isEmpty(response)) {
          return buildResponse(404, body);
        }
        body = {
          message: 'SUCCESS',
          item: response,
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

async function getUserCharacters() {
  let body = {
    message: 'SUCCESS',
    characterTypes: [],
  };
  const params = {
    TableName: table.userCharacter,
  };
  const allUserCharacters = await scanDynamoRecords(params, []);
  body.userCharacters = allUserCharacters;
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
        if (!response.Attributes) {
          body = {
            message: 'Cannot modify item that does not exist!',
          };
          return buildResponse(404, body);
        }
        body = {
          message: 'SUCCESS!',
          updatedAttributes: response,
        };
        return buildResponse(200, body);
      },
      error => {
        body.message = error.message;
        return buildResponse(400, body);
      }
    );
}

async function deleteUserCharacter(userCharacterId) {
  let body = {
    message: 'FAILED',
  };
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
        if (!response.Attributes) {
          body = {
            message: 'Cannot delete item that does not exist',
          };
          return buildResponse(404, body);
        }
        body = {
          message: 'SUCCESS',
          item: response,
        };
        return buildResponse(200, body);
      },
      error => {
        body.message = error.message;
        return buildResponse(400, body);
      }
    );
}

async function saveUserCharacter(requestBody) {
  let body = {
    message: 'Failed',
  };
  const character = await dynamo.get({
    TableName: table.character,
    Key: requestBody.characterId,
  });
  if (!character.Attributes) {
    body.message = 'character is not exist!';
    return buildResponse(400, body);
  }
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
