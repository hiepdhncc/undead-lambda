const { v4: uuid } = require('uuid');
const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const _ = require('lodash');

async function getCharacter(characterId) {
  let body = {
    message: 'No item match!',
  };
  const params = {
    TableName: table.character,
    Key: {
      id: characterId,
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

async function getCharacters() {
  let body = {
    message: 'SUCCESS',
    characters: [],
  };
  const params = {
    TableName: table.character,
  };
  const allCharacters = await scanDynamoRecords(params, []);
  body.characters = allCharacters;
  return buildResponse(200, body);
}

async function modifyCharacter(characterId, updateKey, updateValue) {
  const params = {
    TableName: table.character,
    Key: {
      id: characterId,
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

async function deleteCharacter(characterId) {
  let body = {
    message: 'FAILED!',
  };
  const params = {
    TableName: table.character,
    Key: {
      id: characterId,
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

async function saveCharacter(requestBody) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.character,
    Item: {
      id: uuid(),
      character_type_id: requestBody.characterTypeId || '',
      hp: parseInt(requestBody.hp) || 0,
      armor: parseInt(requestBody.armor) || 0,
      speed: parseFloat(requestBody) || 0.0,
      crouch_speed: parseFloat(requestBody.crouchSpeed) || 0.0,
      sprint_speed: parseFloat(requestBody.sprintSpeed) || 0.0,
      cross_speed: parseFloat(requestBody.crossSpeed) || 0.0,
      backward_speed: parseFloat(requestBody.backwardSpeed) || 0.0,
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
    data: body,
  };
}

module.exports = {
  saveCharacter,
  deleteCharacter,
  getCharacter,
  getCharacters,
  modifyCharacter,
};
