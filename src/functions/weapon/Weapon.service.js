const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const { v4: uuid } = require('uuid');

async function getWeapon(weaponId) {
  let body = {
    message: 'No item match!',
  };
  const params = {
    TableName: table.weapon,
    Key: {
      id: weaponId,
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

async function getWeapons() {
  let body = {
    message: 'SUCCESS',
    weapons: [],
  };
  const params = {
    TableName: table.weapon,
  };
  const allWeapons = await scanDynamoRecords(params, []);
  body.weapons = allWeapons;
  return buildResponse(200, body);
}

async function modifyWeapon(weaponId, updateKey, updateValue) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.weapon,
    Key: {
      id: weaponId,
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

async function deleteWeapon(weaponId) {
  let body = {
    message: 'FAILED',
  };
  const params = {
    TableName: table.weapon,
    Key: {
      id: weaponId,
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

async function saveWeapon(requestBody) {
  let body = {
    message: 'Failed',
  };
  const params = {
    TableName: table.weapon,
    Item: {
      id: uuid(),
      code: requestBody.code || '',
      name: requestBody.name || '',
      weapon_type_id: requestBody.weaponTypeId,
      code: requestBody.code || '',
      name: requestBody.name || '',
      status: requestBody.status || 'LOCK',
      description: requestBody.description || '',
      fire_rate_type: requestBody.fireRateType || '',
      ammo_id: requestBody.ammo_id,
      skin_id: requestBody.skin_id,
      range: requestBody.range,
      dropstart: requestBody.dropstart,
      drop_per_m: requestBody.drop_per_m,
      magazine: requestBody.magazine,
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

module.exports = { saveWeapon, deleteWeapon, getWeapon, getWeapons, modifyWeapon };
