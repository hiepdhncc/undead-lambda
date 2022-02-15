const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const { v4: uuid } = require('uuid');
const _ = require('lodash');

async function getCharacterType(characterTypeId) {
  let body = {
    message: 'No item match!',
  };
  const params = {
    TableName: table.characterType,
    Key: {
      id: characterTypeId,
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

async function getCharacterTypes() {
  let body = {
    message: 'SUCCESS',
    characterTypes: [],
  };
  const params = {
    TableName: table.characterType,
  };
  const allCharacterTypes = await scanDynamoRecords(params, []);
  body.characterTypes = allCharacterTypes;
  return buildResponse(200, body);
}

async function modifyCharacterType(characterTypeId, updateKey, updateValue) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.characterType,
    Key: {
      id: characterTypeId,
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues: {
      ':value': updateValue,
    },
    // UpdateExpression: `set code = :c, description = :d`,
    // ExpressionAttributeValues: {
    //   ':c': requestBody.code,
    //   ':d': requestBody.description,
    // },
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

async function deleteCharacterType(characterTypeId) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.characterType,
    Key: {
      id: characterTypeId,
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

async function saveCharacterType(requestBody) {
  let body = {
    message: 'Failed',
  };
  const params = {
    TableName: table.characterType,
    Item: {
      id: uuid(),
      name: requestBody.name || '',
      code: requestBody.code || '',
      nickname: requestBody.nickname || '',
      description: requestBody.description || '',
    },
  };
  console.log(params.Item);
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
  saveCharacterType,
  deleteCharacterType,
  getCharacterType,
  getCharacterTypes,
  modifyCharacterType,
};
