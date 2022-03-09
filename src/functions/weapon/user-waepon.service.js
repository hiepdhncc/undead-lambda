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
      weapon_level_id: requestBody.weaponLevelId || '',
      is_iquipped: requestBody.is_iquipped || '',
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

async function getAllWeaponOfUser(userId) {
  let body = {
    message: 'Failed',
  };
  let weapons = [];
  const userWeapons = await scanDynamoRecords(
    {
      TableName: table.userWeapon,
      ScanFilter: {
        user_id: {
          AttributeValueList: { S: userId },
          ComparisonOperator: 'EQ',
        },
      },
    },
    []
  );
  for (let i = 0; i < userWeapons.length; i++) {
    const weapon = await dynamo
      .get({
        TableName: table.weapon,
        Key: {
          id: userWeapons[i].weapon_id,
        },
      })
      .promise();
    console.log(weapon.Item, 'DD');
    weapons.push(weapon.Item);
  }
  body = {
    message: 'success',
    weapons,
  };
  return buildResponse(200, body);
}

async function getWeaponDetail(userId, weaponLevelId) {
  let body = {
    message: 'Failed',
  };
  const userWeapon = await scanDynamoRecords(
    {
      TableName: table.userWeapon,
      ScanFilter: {
        user_id: {
          AttributeValueList: { S: userId },
          ComparisonOperator: 'EQ',
        },
        weapon_level_id: {
          AttributeValueList: { S: weaponLevelId },
          ComparisonOperator: 'EQ',
        },
      },
    },
    []
  );
  if (userWeapon.length === 0) return buildResponse(404, body);
  const weaponLevel = await dynamo
    .get({
      TableName: table.weaponLevel,
      Key: {
        id: weaponLevelId,
      },
    })
    .promise();
  const skin = await dynamo
    .get({
      TableName: table.skin,
      Key: {
        id: weaponLevel.skin_id,
      },
    })
    .promise();
  const wp = await dynamo
    .get({
      TableName: table.weapon,
      Key: {
        id: userWeapon[0].weapon_id,
      },
    })
    .promise();
  const weapon = {
    progress: userWeapon.progress,
    name: `${wp.name} - ${wp.code}`,
    level: weaponLevel.level,
    skin : skin.Item,
    range: weaponLevel.range,
    acuracy:1,
    fireRate:1
  };
  body = {
    message: 'success',
    weapon,
  };
  return buildResponse(200, body);
}

// async function upgradeWeaponLevel(userId, weaponLevelId) {
//   let body = {
//     message: 'Failed',
//   };
//   const userWeapon = await scanDynamoRecords(
//     {
//       TableName: table.userWeapon,
//       ScanFilter: {
//         user_id: {
//           AttributeValueList: { S: userId },
//           ComparisonOperator: 'EQ',
//         },
//         weapon_level_id: {
//           AttributeValueList: { S: weaponLevelId },
//           ComparisonOperator: 'EQ',
//         },
//       },
//     },
//     []
//   );
//   if (userWeapon.length === 0) return buildResponse(404, body);
//   const weaponLevel = await dynamo
//     .get({
//       TableName: table.weaponLevel,
//       Key: {
//         id: weaponLevelId,
//       },
//     })
//     .promise();
//   const wp = await dynamo
//     .get({
//       TableName: table.weapon,
//       Key: {
//         id: userWeapon[0].weapon_id,
//       },
//     })
//     .promise();
//   const weapon = {
//     progress: userWeapon.progress,
//     name: `${wp.name} - ${wp.code}`,
//     level: weaponLevel.level,
//   };
//   body = {
//     message: 'success',
//     weapon,
//   };
//   return buildResponse(200, body);
// }

module.exports = {
  getAllWeaponOfUser,
  saveUserWeapon,
  deleteUserWeapon,
  getUserWeapon,
  getUserWeapons,
  modifyUserWeapon,
  getWeaponDetail,
};
