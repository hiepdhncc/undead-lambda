const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const { v4: uuid } = require('uuid');
const _ = require('lodash');

async function getUserWeapon(userWeaponId) {
  let body = {
    message: 'No item match!',
  };
  const params = {
    TableName: table.userWeapon,
    Key: {
      id: userWeaponId,
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

async function getUserWeapons() {
  let body = {
    message: 'SUCCESS',
    userWeapons: [],
  };
  const params = {
    TableName: table.userWeapon,
  };
  const allUserWeapons = await scanDynamoRecords(params, []);
  body.userWeapons = allUserWeapons;
  return buildResponse(200, body);
}

async function modifyUserWeapon(userWeaponId, updateKey, updateValue) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.userWeapon,
    Key: {
      id: userWeaponId,
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

async function deleteUserWeapon(userWeaponId) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.userWeapon,
    Key: {
      id: userWeaponId,
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

async function saveUserWeapon(requestBody) {
  let body = {
    message: 'Failed',
  };
  const params = {
    TableName: table.userWeapon,
    Item: {
      id: uuid(),
      user_id: requestBody.userId || '',
      weapon_id: requestBody.weaponId || '',
      weapon_level_id: requestBody.weaponLevelId || '',
      progress: requestBody.progress || '',
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
  saveUserWeapon,
  deleteUserWeapon,
  getUserWeapon,
  getUserWeapons,
  modifyUserWeapon,
};
