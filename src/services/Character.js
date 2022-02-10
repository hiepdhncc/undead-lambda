const { v4: uuid } = require('uuid');
const dynamo = require('../config/dynamo');
const table = require('../constants/table');

async function getCharacter(characterId) {
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
      (response) => buildResponse(200, response.Item),
      (err) => {
        console.error('Err...: ', err);
      },
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
  const params = {
    TableName: table.character,
  };
  const allCharacters = await scanDynamoRecords(params, []);
  const body = {
    characters: allCharacters,
  };
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
      (response) => {
        const body = {
          Operation: 'UPDATE',
          Message: 'SUCCESS',
          UpdatedAttributes: response,
        };
        return buildResponse(200, body);
      },
      (error) => {
        console.error(
          'Do your custom error handling here. I am just gonna log it: ',
          error,
        );
      },
    );
}

async function deleteCharacter(characterId) {
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
      (response) => {
        const body = {
          Operation: 'DELETE',
          Message: 'SUCCESS',
          Item: response,
        };
        return buildResponse(200, body);
      },
      (error) => {
        console.error(
          'Do your custom error handling here. I am just gonna log it: ',
          error,
        );
      },
    );
}

async function saveCharacter(requestBody) {
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
        const body = {
          Operation: 'SAVE',
          Message: 'SUCCESS',
          Item: params.Item,
        };
        return buildResponse(200, body);
      },
      (error) => {
        console.error(
          'Do your custom error handling here. I am just gonna log it: ',
          error,
        );
      },
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
