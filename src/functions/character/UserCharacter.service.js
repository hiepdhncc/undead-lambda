const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const { v4: uuid } = require('uuid');
const _ = require('lodash');
const { characterRarityEnum } = require('./action.constant')

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
  let body = {
    message: 'FAILED',
  };
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

async function equipUserCharacter(userId, userCharacterId) {
  const params = {
    TableName: table.userCharacter,
    Key: {
      "user_id": userId,
      "is_equipped": true
    },
  };
  const equippedUserCharacter = await scanDynamoRecords(params, []);
  if (equippedUserCharacter != []) {
    const id = equippedUserCharacter[0].id
    await modifyUserCharacter(id, "is_equipped", false);
  }
  return await modifyUserCharacter(userCharacterId, "is_equipped", true)
}

async function initUserCharacter(userId) {
  const params = {
    TableName: table.character,
  };
  const characters = await scanDynamoRecords(params, []);
  for (let character of characters) {
    let body = {
      userId,
      characterId: character.id,
      rarity: character.rarity
    }
    await saveUserCharacter(body);
  }
}

async function unlockUserCharacter(userCharacterId) {
  return await modifyUserCharacter(userCharacterId, "is_locked", false)
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
    message: 'FAILED',
  };
  const param = {
    TableName: table.character,
    Key: {
      id: requestBody.characterId,
    },
  };
  const character = await dynamo.get(param).promise();
  if (!character) {
    body.message = 'character is not exist!';
    return buildResponse(400, body);
  }
  const params = {
    TableName: table.userCharacter,
    Item: {
      id: uuid(),
      user_id: requestBody.userId || '',
      character_id: requestBody.characterId || '',
      is_equipped: false,
      is_locked: requestBody.rarity != characterRarityEnum.normal
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
  equipUserCharacter,
  initUserCharacter
};
