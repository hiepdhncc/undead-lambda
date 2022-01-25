const dynamo = require('../config/dynamo')
const table = require('../constants/table');
const { v4: uuid } = require('uuid');


async function getWeaponType(WeaponTypeId) {
  const params = {
    TableName: table.weaponType,
    Key: {
      'id': weaponTypeId,
    }
  };
  return await dynamo.get(params).promise().then((response) => {
    return buildResponse(200, response.item);
  }, err => {
    console.error('Err...: ', err);
  });
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

async function getWeaponTypes() {
  const params = {
    TableName: table.weaponType,
  };
  const allWeaponTypes = await scanDynamoRecords(params, []);
  const body = {
    weaponTypes: allWeaponTypes,
  };
  return buildResponse(200, body);
}


async function modifyWeaponType(weaponTypeId, updateKey, updateValue) {
  const params = {
    TableName: table.weaponType,
    Key: {
      'id': weaponTypeId
    },
    UpdateExpression: `set ${updateKey} = :value`,
    ExpressionAttributeValues: {
      ':value': updateValue
    },
    ReturnValues: 'UPDATED_NEW'
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

async function deleteWeaponType(weaponTypeId) {
  const params = {
    TableName: table.weaponType,
    Key: {
      'id': weaponTypeId
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

async function saveWeaponType(requestBody){
  const params = {
    TableName: table.weaponType,
    Item: {
      id: uuid(),
      code: requestBody.code||'',
      name: requestBody.name||''
    }
  };
  return await dynamo.put(params).promise().then(() => {
    const body = {
      Operation: 'SAVE',
      Message: 'SUCCESS',
      Item: params.Item
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
    body: JSON.stringify(body),
  };
}

module.exports = {saveWeaponType, deleteWeaponType, getWeaponType, getWeaponTypes, modifyWeaponType};