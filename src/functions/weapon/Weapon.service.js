const dynamo = require('./dynamo.config');
const table = require('./table.constant');
const { v4: uuid } = require('uuid');

async function getWeapon(weaponId) {
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
        return buildResponse(200, response.item);
      },
      err => {
        console.error('Err...: ', err);
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
  const params = {
    TableName: table.weapon,
  };
  const allWeapons = await scanDynamoRecords(params, []);
  const body = {
    weapons: allWeapons,
  };
  return buildResponse(200, body);
}

async function modifyWeapon(weaponId, updateKey, updateValue) {
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

async function deleteWeapon(weaponId) {
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

async function saveWeapon(requestBody) {
  const params = {
    TableName: table.weapon,
    Item: {
      id: uuid(),
      weapon_type_id: requestBody.weaponTypeId,
      code: requestBody.code || '',
      name: requestBody.name || '',
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

module.exports = { saveWeapon, deleteWeapon, getWeapon, getWeapons, modifyWeapon };
